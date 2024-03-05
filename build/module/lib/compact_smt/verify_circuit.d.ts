import { Bool, Field, Provable } from 'o1js';
import { CompactSparseMerkleProof } from './proofs.js';
import { TreeHasher } from './tree_hasher.js';
export { ProvableCSMTUtils };
/**
 * Collection of utility functions for compact sparse merkle tree in the circuit.
 *
 * @class ProvableCSMTUtils
 */
declare class ProvableCSMTUtils {
    /**
     * Returns true if the value is in the tree and it is at the index from the key
     *
     * @static
     * @template K
     * @template V
     * @param {CompactSparseMerkleProof} proof
     * @param {Field} expectedRoot
     * @param {K} key
     * @param {Provable<K>} keyType
     * @param {V} value
     * @param {Provable<V>} valueType
     * @param {{
     *       treeHasher: TreeHasher<K, V>;
     *       hashKey: boolean;
     *       hashValue: boolean;
     *     }} [options={
     *       treeHasher: TreeHasher.poseidon(),
     *       hashKey: true,
     *       hashValue: true,
     *     }] treeHasher: The tree hasher function to use, defaults to TreeHasher.poseidon; hashKey:
     * whether to hash the key, the default is true; hashValue: whether to hash the value,
     * the default is true.
     * @return {*}  {Bool}
     * @memberof ProvableCSMTUtils
     */
    static checkMembership<K, V>(proof: CompactSparseMerkleProof, expectedRoot: Field, key: K, keyType: Provable<K>, value: V, valueType: Provable<V>, options?: {
        treeHasher: TreeHasher<K, V>;
        hashKey: boolean;
        hashValue: boolean;
    }): Bool;
    /**
     * Returns true if there is no value at the index from the key
     *
     * @static
     * @template K
     * @template V
     * @param {CompactSparseMerkleProof} proof
     * @param {Field} expectedRoot
     * @param {K} key
     * @param {Provable<K>} keyType
     * @param {{ treeHasher: TreeHasher<K, V>; hashKey: boolean }} [options={
     *       treeHasher: TreeHasher.poseidon(),
     *       hashKey: true,
     *     }] treeHasher: The tree hasher function to use, defaults to TreeHasher.poseidon;
     * hashKey: whether to hash the key, the default is true
     * @return {*}  {Bool}
     * @memberof ProvableCSMTUtils
     */
    static checkNonMembership<K, V>(proof: CompactSparseMerkleProof, expectedRoot: Field, key: K, keyType: Provable<K>, options?: {
        treeHasher: TreeHasher<K, V>;
        hashKey: boolean;
    }): Bool;
}
