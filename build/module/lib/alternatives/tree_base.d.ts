/// <reference types="node" />
import { ChainedBatch, Level } from "level";
import { BaseSiblingPath } from './types/index.js';
import { Hasher } from './types/index.js';
import { IMerkleTree } from './interfaces/merkle_tree.js';
import { Field } from 'o1js';
export declare const decodeMeta: (meta: Buffer) => {
    root: import("o1js/dist/node/lib/field.js").Field;
    depth: number;
    size: bigint;
};
export declare const INITIAL_LEAF: import("o1js/dist/node/lib/field.js").Field;
/**
 * A Merkle tree implementation that uses a LevelDB database to store the tree.
 */
export declare abstract class TreeBase implements IMerkleTree {
    protected db: Level<string, Buffer>;
    protected hasher: Hasher;
    private name;
    private depth;
    protected size: bigint;
    protected readonly maxIndex: bigint;
    protected cachedSize?: bigint;
    private root;
    private zeroHashes;
    private cache;
    constructor(db: Level<string, Buffer>, hasher: Hasher, name: string, depth: number, size?: bigint, root?: Field);
    /**
     * Returns the root of the tree.
     * @param includeUncommitted - If true, root incorporating uncomitted changes is returned.
     * @returns The root of the tree.
     */
    getRoot(includeUncommitted: boolean): Field;
    /**
     * Returns the number of leaves in the tree.
     * @param includeUncommitted - If true, the returned number of leaves includes uncomitted changes.
     * @returns The number of leaves in the tree.
     */
    getNumLeaves(includeUncommitted: boolean): bigint;
    /**
     * Returns the name of the tree.
     * @returns The name of the tree.
     */
    getName(): string;
    /**
     * Returns the depth of the tree.
     * @returns The depth of the tree.
     */
    getDepth(): number;
    /**
     * Returns a sibling path for the element at the given index.
     * @param index - The index of the element.
     * @param includeUncommitted - Indicates whether to get a sibling path incorporating uncommitted changes.
     * @returns A sibling path for the element at the given index.
     * Note: The sibling path is an array of sibling hashes, with the lowest hash (leaf hash) first, and the highest hash last.
     */
    getSiblingPath(index: bigint, includeUncommitted: boolean): Promise<BaseSiblingPath>;
    /**
     * Commits the changes to the database.
     * @returns Empty promise.
     */
    commit(): Promise<void>;
    /**
     * Rolls back the not-yet-committed changes.
     * @returns Empty promise.
     */
    rollback(): Promise<void>;
    /**
     * Gets the value at the given index.
     * @param index - The index of the leaf.
     * @param includeUncommitted - Indicates whether to include uncommitted changes.
     * @returns Leaf value at the given index or undefined.
     */
    getLeafValue(index: bigint, includeUncommitted: boolean): Promise<Field | undefined>;
    /**
     * Clears the cache.
     */
    private clearCache;
    /**
     * Adds a leaf and all the hashes above it to the cache.
     * @param leaf - Leaf to add to cache.
     * @param index - Index of the leaf (used to derive the cache key).
     */
    protected addLeafToCacheAndHashToRoot(leaf: Field, index: bigint): Promise<void>;
    /**
     * Returns the latest value at the given index.
     * @param level - The level of the tree.
     * @param index - The index of the element.
     * @param includeUncommitted - Indicates, whether to get include uncomitted changes.
     * @returns The latest value at the given index.
     * Note: If the value is not in the cache, it will be fetched from the database.
     */
    private getLatestValueAtIndex;
    /**
     * Gets a value from db by key.
     * @param key - The key to by which to get the value.
     * @returns A value from the db based on the key.
     */
    private dbGet;
    /**
     * Initializes the tree.
     * @param prefilledSize - A number of leaves that are prefilled with values.
     * @returns Empty promise.
     */
    init(prefilledSize: number): Promise<void>;
    /**
     * Initializes the tree from the database.
     */
    initFromDb(): Promise<void>;
    /**
     * Writes meta data to the provided batch.
     * @param batch - The batch to which to write the meta data.
     */
    protected writeMeta(batch?: ChainedBatch<Level<string, Buffer>, string, Buffer>): Promise<void>;
}
