// import { LevelUp, LevelUpChain } from 'levelup';
import { ChainedBatch, Level } from "level";
import { BaseSiblingPath, SiblingPath } from './types';
import { Hasher } from './types';
import { IMerkleTree } from './interfaces/merkle_tree.js';
import { toBigIntLE, toBufferLE, bufferToInt256, int256ToBuffer  } from '../utils';
import { Field } from 'o1js';

const MAX_DEPTH = 254;

const indexToKeyHash = (name: string, level: number, index: bigint) =>
  `${name}:${level}:${index}`;

const encodeMeta = (root: Field, depth: number, size: bigint) => {
  const rootBuf = int256ToBuffer(root.toBigInt()); // 32-bytes buffer
  const data = Buffer.alloc(32 + 4);
  rootBuf.copy(data);
  data.writeUInt32LE(depth, 32);
  return Buffer.concat([data, toBufferLE(size, 32)]);
};

export const decodeMeta = (meta: Buffer) => {
  const root = Field(bufferToInt256(meta.subarray(0, 32)));
  const depth = meta.readUInt32LE(32);
  const size = toBigIntLE(meta.subarray(36));
  return {
    root,
    depth,
    size,
  };
};

export const INITIAL_LEAF = Field(0);

/**
 * A Merkle tree implementation that uses a LevelDB database to store the tree.
 */
export abstract class TreeBase implements IMerkleTree {
  protected readonly maxIndex: bigint;
  protected cachedSize?: bigint;
  private root!: Field;
  private zeroHashes: Field[] = [];
  private cache: { [key: string]: Buffer } = {};

  public constructor(
    protected db: Level<string, Buffer>,
    protected hasher: Hasher,
    private name: string,
    private depth: number,
    protected size: bigint = 0n,
    root?: Field
  ) {
    if (!(depth >= 1 && depth <= MAX_DEPTH)) {
      throw Error('Invalid depth');
    }

    // Compute the zero values at each layer.
    let current = INITIAL_LEAF;
    for (let i = depth - 1; i >= 0; --i) {
      this.zeroHashes[i] = current;
      current = hasher.compress(current, current);
    }

    this.root = root ? root : current;
    this.maxIndex = 2n ** BigInt(depth) - 1n;
  }

  /**
   * Returns the root of the tree.
   * @param includeUncommitted - If true, root incorporating uncomitted changes is returned.
   * @returns The root of the tree.
   */
  public getRoot(includeUncommitted: boolean): Field {
    if (!includeUncommitted) {
      return this.root;
    } else {
      let tmpRootBuffer = this.cache[indexToKeyHash(this.name, 0, 0n)];
      if (tmpRootBuffer) {
        return Field(tmpRootBuffer.toString());
      } else {
        return this.root;
      }
    }
  }

  /**
   * Returns the number of leaves in the tree.
   * @param includeUncommitted - If true, the returned number of leaves includes uncomitted changes.
   * @returns The number of leaves in the tree.
   */
  public getNumLeaves(includeUncommitted: boolean) {
    return !includeUncommitted ? this.size : this.cachedSize ?? this.size;
  }

  /**
   * Returns the name of the tree.
   * @returns The name of the tree.
   */
  public getName(): string {
    return this.name;
  }

  /**
   * Returns the depth of the tree.
   * @returns The depth of the tree.
   */
  public getDepth(): number {
    return this.depth;
  }

  /**
   * Returns a sibling path for the element at the given index.
   * @param index - The index of the element.
   * @param includeUncommitted - Indicates whether to get a sibling path incorporating uncommitted changes.
   * @returns A sibling path for the element at the given index.
   * Note: The sibling path is an array of sibling hashes, with the lowest hash (leaf hash) first, and the highest hash last.
   */
  public async getSiblingPath(
    index: bigint,
    includeUncommitted: boolean
  ): Promise<BaseSiblingPath> {
    const path: Field[] = [];
    let level = this.depth;

    while (level > 0) {
      const isRight = index & 0x01n;
      const sibling = await this.getLatestValueAtIndex(
        level,
        isRight ? index - 1n : index + 1n,
        includeUncommitted
      );
      path.push(sibling);
      level -= 1;
      index >>= 1n;
    }

    class SiblingPath_ extends SiblingPath(this.depth) {}

    return new SiblingPath_(path);
  }

  /**
   * Commits the changes to the database.
   * @returns Empty promise.
   */
  public async commit(): Promise<void> {
    const batch = this.db.batch();
    const keys = Object.getOwnPropertyNames(this.cache);
    for (const key of keys) {
      batch.put(key, this.cache[key]);
    }

    await this.writeMeta(batch);
    await batch.write();

    this.size = this.getNumLeaves(true);
    this.root = this.getRoot(true);

    this.clearCache();
  }

  /**
   * Rolls back the not-yet-committed changes.
   * @returns Empty promise.
   */
  public rollback(): Promise<void> {
    this.clearCache();
    return Promise.resolve();
  }

  /**
   * Gets the value at the given index.
   * @param index - The index of the leaf.
   * @param includeUncommitted - Indicates whether to include uncommitted changes.
   * @returns Leaf value at the given index or undefined.
   */
  public getLeafValue(
    index: bigint,
    includeUncommitted: boolean
  ): Promise<Field | undefined> {
    return this.getLatestValueAtIndex(this.depth, index, includeUncommitted);
  }

  /**
   * Clears the cache.
   */
  private clearCache() {
    this.cache = {};
    this.cachedSize = undefined;
  }

  /**
   * Adds a leaf and all the hashes above it to the cache.
   * @param leaf - Leaf to add to cache.
   * @param index - Index of the leaf (used to derive the cache key).
   */
  protected async addLeafToCacheAndHashToRoot(leaf: Field, index: bigint) {
    const key = indexToKeyHash(this.name, this.depth, index);
    let current = leaf;
    this.cache[key] = Buffer.from(current.toString());
    let level = this.depth;

    while (level > 0) {
      const isRight = index & 0x01n;
      const sibling = await this.getLatestValueAtIndex(
        level,
        isRight ? index - 1n : index + 1n,
        true
      );
      const lhs = isRight ? sibling : current;
      const rhs = isRight ? current : sibling;
      current = this.hasher.compress(lhs, rhs);
      level -= 1;
      index >>= 1n;

      const cacheKey = indexToKeyHash(this.name, level, index);
      this.cache[cacheKey] = Buffer.from(current.toString());
    }
  }

  /**
   * Returns the latest value at the given index.
   * @param level - The level of the tree.
   * @param index - The index of the element.
   * @param includeUncommitted - Indicates, whether to get include uncomitted changes.
   * @returns The latest value at the given index.
   * Note: If the value is not in the cache, it will be fetched from the database.
   */
  private async getLatestValueAtIndex(
    level: number,
    index: bigint,
    includeUncommitted: boolean
  ): Promise<Field> {
    const key = indexToKeyHash(this.name, level, index);
    if (includeUncommitted && this.cache[key] !== undefined) {
      return Field(this.cache[key].toString());
    }
    const committed = await this.dbGet(key);
    if (committed !== undefined) {
      return committed;
    }
    return this.zeroHashes[level - 1];
  }

  /**
   * Gets a value from db by key.
   * @param key - The key to by which to get the value.
   * @returns A value from the db based on the key.
   */
  private async dbGet(key: string): Promise<Field | undefined> {
    const buf = await this.db.get(key).catch(() => {});
    if (buf !== undefined) {
      return Field(buf.toString());
    }

    return undefined;
  }

  /**
   * Initializes the tree.
   * @param prefilledSize - A number of leaves that are prefilled with values.
   * @returns Empty promise.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async init(prefilledSize: number): Promise<void> {
    // prefilledSize is used only by Indexed Tree.
    await this.writeMeta();
  }

  /**
   * Initializes the tree from the database.
   */
  public async initFromDb(): Promise<void> {
    // Implemented only by Inedexed Tree to populate the leaf cache.
  }

  /**
   * Writes meta data to the provided batch.
   * @param batch - The batch to which to write the meta data.
   */
  protected async writeMeta(batch?: ChainedBatch<Level<string, Buffer>, string, Buffer>) {
    const data = encodeMeta(
      this.getRoot(true),
      this.depth,
      this.getNumLeaves(true)
    );
    if (batch) {
      batch.put(this.name, data);
    } else {
      await this.db.put(this.name, data);
    }
  }
}
