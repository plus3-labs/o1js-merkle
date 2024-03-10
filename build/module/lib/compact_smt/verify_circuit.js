import { Circuit } from 'o1js';
import { CP_PADD_VALUE, CSMT_DEPTH, PLACEHOLDER } from './constant.js';
import { TreeHasher } from './tree_hasher.js';
export { ProvableCSMTUtils };
/**
 * Collection of utility functions for compact sparse merkle tree in the circuit.
 *
 * @class ProvableCSMTUtils
 */
class ProvableCSMTUtils {
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
    static checkMembership(proof, expectedRoot, key, keyType, value, valueType, options = {
        treeHasher: TreeHasher.poseidon(keyType, valueType),
        hashKey: true,
        hashValue: true,
    }) {
        let th = options.treeHasher;
        let keyHashOrKeyField = null;
        if (options.hashKey) {
            keyHashOrKeyField = th.path(key);
        }
        else {
            keyHashOrKeyField = keyType.toFields(key)[0];
        }
        let valueHashOrValueField = null;
        if (options.hashValue) {
            valueHashOrValueField = th.digestValue(value);
        }
        else {
            valueHashOrValueField = valueType.toFields(value)[0];
        }
        const path = keyHashOrKeyField;
        let currentHash = th.digestLeaf(path, valueHashOrValueField).hash;
        const currentRoot = computeRootInCircuit(proof.sideNodes, path, currentHash, th);
        return expectedRoot.equals(currentRoot);
    }
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
    static checkNonMembership(proof, expectedRoot, key, keyType, options = {
        treeHasher: TreeHasher.poseidon(keyType),
        hashKey: true,
    }) {
        let th = options.treeHasher;
        let keyHashOrKeyField = null;
        if (options.hashKey) {
            keyHashOrKeyField = th.path(key);
        }
        else {
            keyHashOrKeyField = keyType.toFields(key)[0];
        }
        const path = keyHashOrKeyField;
        const { path: actualPath, leaf: leafData } = th.parseLeaf(proof.nonMembershipLeafData);
        let currentHash = Circuit.if(th.isEmptyDataInCircuit(proof.nonMembershipLeafData), PLACEHOLDER, th.digestLeaf(actualPath, leafData).hash);
        const currentRoot = computeRootInCircuit(proof.sideNodes, path, currentHash, th);
        return expectedRoot.equals(currentRoot);
    }
}
function computeRootInCircuit(sideNodes, keyHashOrKeyField, valueHashOrValueField, th = TreeHasher.poseidon()) {
    const path = keyHashOrKeyField;
    let currentHash = valueHashOrValueField;
    const pathBits = path.toBits(CSMT_DEPTH);
    //Recompute root
    for (let i = 0, len = sideNodes.length; i < len; i++) {
        let node = sideNodes[i];
        // right node
        currentHash = Circuit.if(pathBits[len - 1 - i].and(node.equals(CP_PADD_VALUE).not()), th.digestNode(node, currentHash).hash, currentHash);
        // left node
        currentHash = Circuit.if(pathBits[len - 1 - i].not().and(node.equals(CP_PADD_VALUE).not()), th.digestNode(currentHash, node).hash, currentHash);
    }
    return currentHash;
}
