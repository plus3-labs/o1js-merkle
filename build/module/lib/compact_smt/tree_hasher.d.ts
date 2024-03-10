import { Bool, Field, Provable } from 'o1js';
import { Hasher } from '../model.js';
export { TreeHasher };
/**
 * Tree Hasher
 *
 * @class TreeHasher
 * @template K
 * @template V
 */
declare class TreeHasher<K, V> {
    private hasher;
    private keyType?;
    private valueType?;
    /**
     * Creates an instance of TreeHasher.
     * @param {Provable<V>} keyType
     * @param {Provable<V>} valueType
     * @param {Hasher} [hasher=PoseidonHasherFunc]
     * @memberof TreeHasher
     */
    constructor(hasher?: Hasher, keyType?: Provable<K>, valueType?: Provable<V>);
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
    static poseidon<K, V>(keyType?: Provable<K>, valueType?: Provable<V>): TreeHasher<K, V>;
    digestValue(value: V): Field;
    path(k: K): Field;
    getHasher(): Hasher;
    digestLeaf(path: Field, leafData: Field): {
        hash: Field;
        value: Field[];
    };
    parseLeaf(data: Field[]): {
        path: Field;
        leaf: Field;
    };
    isLeaf(data: Field[]): boolean;
    isEmptyData(data: Field[]): boolean;
    isEmptyDataInCircuit(data: Field[]): Bool;
    emptyData(): Field[];
    digestNode(leftData: Field, rightData: Field): {
        hash: Field;
        value: Field[];
    };
    parseNode(data: Field[]): {
        leftNode: Field;
        rightNode: Field;
    };
}
