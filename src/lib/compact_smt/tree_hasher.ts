import { Bool, Field, Poseidon, Provable } from 'o1js';
import { Hasher, PoseidonHasherFunc } from '../model.js';

export { TreeHasher };

const emptyPrefix = Field(0);
const leafPrefix = Field(1);
const nodePrefix = Field(2);

const emptyData = Field(0);

/**
 * Tree Hasher
 *
 * @class TreeHasher
 * @template K
 * @template V
 */
class TreeHasher<K, V> {
  private hasher: Hasher;
  private keyType?: Provable<K>;
  private valueType?: Provable<V>;

  /**
   * Creates an instance of TreeHasher.
   * @param {Provable<V>} keyType
   * @param {Provable<V>} valueType
   * @param {Hasher} [hasher=PoseidonHasherFunc]
   * @memberof TreeHasher
   */
  constructor(
    hasher: Hasher = PoseidonHasherFunc,
    keyType?: Provable<K>,
    valueType?: Provable<V>
  ) {
    this.hasher = hasher;
    this.keyType = keyType;
    this.valueType = valueType;
  }

  /**
   * Tree Hasher based on PoseidonHasherFunc
   *
   * @static
   * @template K
   * @template V
   * @param {Provable<K>} keyType
   * @param {Provable<V>} valueType
   * @return {*}  {TreeHasher<K, V>}
   * @memberof TreeHasher
   */
  static poseidon<K, V>(
    keyType?: Provable<K>,
    valueType?: Provable<V>
  ): TreeHasher<K, V> {
    return new TreeHasher(PoseidonHasherFunc, keyType, valueType);
  }

  digestValue(value: V): Field {
    return this.hasher(this.valueType!.toFields(value));
  }

  path(k: K): Field {
    return this.hasher(this.keyType!.toFields(k));
  }

  getHasher(): Hasher {
    return this.hasher;
  }

  digestLeaf(path: Field, leafData: Field): { hash: Field; value: Field[] } {
    const value: Field[] = [leafPrefix, path, leafData];

    return {
      hash: this.hasher(value),
      value,
    };
  }

  parseLeaf(data: Field[]): { path: Field; leaf: Field } {
    return {
      path: data[1],
      leaf: data[2],
    };
  }

  isLeaf(data: Field[]): boolean {
    return data[0].equals(leafPrefix).toBoolean();
  }

  isEmptyData(data: Field[]): boolean {
    return data[0].equals(emptyPrefix).toBoolean();
  }

  isEmptyDataInCircuit(data: Field[]): Bool {
    return data[0].equals(emptyPrefix);
  }

  emptyData(): Field[] {
    return [emptyPrefix, emptyData, emptyData];
  }

  digestNode(
    leftData: Field,
    rightData: Field
  ): { hash: Field; value: Field[] } {
    const value: Field[] = [nodePrefix, leftData, rightData];

    return {
      hash: this.hasher(value),
      value,
    };
  }

  parseNode(data: Field[]): { leftNode: Field; rightNode: Field } {
    return {
      leftNode: data[1],
      rightNode: data[2],
    };
  }
}
