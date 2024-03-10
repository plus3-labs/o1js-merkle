import { Field, Provable } from 'o1js';
import { EMPTY_VALUE, SMT_DEPTH } from '../constant.js';
import { PoseidonHasherFunc } from '../model.js';
export { ProvableSMTUtils };
/**
 * Collection of utility functions for sparse merkle tree in the circuit.
 *
 * @class ProvableSMTUtils
 */
class ProvableSMTUtils {
    /**
     * Returns true if the value is in the tree and it is at the index from the key
     *
     * @static
     * @template K
     * @template V
     * @param {SparseMerkleProof} proof
     * @param {Field} expectedRoot
     * @param {K} key
     * @param {Provable<K>} keyType
     * @param {V} value
     * @param {Provable<V>} valueType
     * @param {{ hasher?: Hasher; hashKey: boolean; hashValue: boolean }} [options={
     *       hasher: PoseidonHasherFunc,
     *       hashKey: true,
     *       hashValue: true,
     *     }]  hasher: The hash function to use, defaults to PoseidonHasherFunc; hashKey:
     * whether to hash the key, the default is true; hashValue: whether to hash the value,
     * the default is true.
     * @return {*}  {Bool}
     * @memberof ProvableSMTUtils
     */
    static checkMembership(proof, expectedRoot, key, keyType, value, valueType, options = {
        hasher: PoseidonHasherFunc,
        hashKey: true,
        hashValue: true,
    }) {
        let hasher = PoseidonHasherFunc;
        if (options.hasher !== undefined) {
            hasher = options.hasher;
        }
        let keyFields = keyType.toFields(key);
        let valueFields = valueType.toFields(value);
        let keyHashOrKeyField = keyFields[0];
        if (options.hashKey) {
            keyHashOrKeyField = hasher(keyFields);
        }
        let valueHashOrValueField = valueFields[0];
        if (options.hashValue) {
            valueHashOrValueField = hasher(valueFields);
        }
        return verifyProofByFieldInCircuit(proof, expectedRoot, keyHashOrKeyField, valueHashOrValueField, hasher);
    }
    /**
     * Returns true if there is no value at the index from the key
     *
     * @static
     * @template K
     * @param {SparseMerkleProof} proof
     * @param {Field} expectedRoot
     * @param {K} key
     * @param {Provable<K>} keyType
     * @param {{ hasher?: Hasher; hashKey: boolean }} [options={
     *       hasher: PoseidonHasherFunc,
     *       hashKey: true,
     *     }]  hasher: The hash function to use, defaults to PoseidonHasherFunc; hashKey:
     * whether to hash the key, the default is true; hashValue: whether to hash the value,
     * the default is true.
     * @return {*}  {Bool}
     * @memberof ProvableSMTUtils
     */
    static checkNonMembership(proof, expectedRoot, key, keyType, options = {
        hasher: PoseidonHasherFunc,
        hashKey: true,
    }) {
        let hasher = PoseidonHasherFunc;
        if (options.hasher !== undefined) {
            hasher = options.hasher;
        }
        let keyFields = keyType.toFields(key);
        let keyHashOrKeyField = keyFields[0];
        if (options.hashKey) {
            keyHashOrKeyField = hasher(keyFields);
        }
        return verifyProofByFieldInCircuit(proof, expectedRoot, keyHashOrKeyField, EMPTY_VALUE, hasher);
    }
    /**
     * Calculate new root based on sideNodes, key and value
     *
     * @static
     * @template K
     * @template V
     * @param {Field[]} sideNodes
     * @param {K} key
     * @param {Provable<K>} keyType
     * @param {V} value
     * @param {Provable<V>} valueType
     * @param {{ hasher?: Hasher; hashKey: boolean; hashValue: boolean }} [options={
     *       hasher: PoseidonHasherFunc,
     *       hashKey: true,
     *       hashValue: true,
     *     }]
     * @return {*}  {Field}
     * @memberof ProvableSMTUtils
     */
    static computeRoot(sideNodes, key, keyType, value, valueType, options = {
        hasher: PoseidonHasherFunc,
        hashKey: true,
        hashValue: true,
    }) {
        let hasher = PoseidonHasherFunc;
        if (options.hasher !== undefined) {
            hasher = options.hasher;
        }
        let keyFields = keyType.toFields(key);
        let valueFields = valueType.toFields(value);
        let keyHashOrKeyField = keyFields[0];
        if (options.hashKey) {
            keyHashOrKeyField = hasher(keyFields);
        }
        let valueHashOrValueField = valueFields[0];
        if (options.hashValue) {
            valueHashOrValueField = hasher(valueFields);
        }
        return computeRootByFieldInCircuit(sideNodes, keyHashOrKeyField, valueHashOrValueField, options.hasher);
    }
}
/**
 * Empty value for sparse merkle tree
 *
 * @static
 * @memberof ProvableSMTUtils
 */
ProvableSMTUtils.EMPTY_VALUE = EMPTY_VALUE;
/**
 * Verify a merkle proof by root, keyHashOrKeyField and valueHashOrValueField
 *
 * @static
 * @param {SparseMerkleProof} proof
 * @param {Field} expectedRoot
 * @param {Field} keyHashOrKeyField
 * @param {Field} valueHashOrValueField
 * @param {Hasher} [hasher=PoseidonHasherFunc]
 * @return {*}  {Bool}
 * @memberof ProvableSMTUtils
 */
ProvableSMTUtils.verifyProofByField = verifyProofByFieldInCircuit;
/**
 * Calculate new root based on sideNodes, keyHashOrKeyField and valueHashOrValueField
 *
 * @static
 * @param {Field[]} sideNodes
 * @param {Field} keyHashOrKeyField
 * @param {Field} valueHashOrValueField
 * @param {Hasher} [hasher=PoseidonHasherFunc]
 * @return {*}  {Field}
 * @memberof ProvableSMTUtils
 */
ProvableSMTUtils.computeRootByField = computeRootByFieldInCircuit;
/**
 * Verify a merkle proof by root, keyHashOrKeyField and valueHashOrValueField in circuit.
 *
 * @param {SparseMerkleProof} proof
 * @param {Field} expectedRoot
 * @param {Field} keyHashOrKeyField
 * @param {Field} valueHashOrValueField
 * @param {Hasher} [hasher=PoseidonHasherFunc]
 * @return {*}  {Bool}
 */
function verifyProofByFieldInCircuit(proof, expectedRoot, keyHashOrKeyField, valueHashOrValueField, hasher = PoseidonHasherFunc) {
    const currentRoot = computeRootByFieldInCircuit(proof.sideNodes, keyHashOrKeyField, valueHashOrValueField, hasher);
    return expectedRoot.equals(currentRoot);
}
/**
 * Calculate new root based on sideNodes, keyHashOrKeyField and valueHashOrValueField in circuit.
 *
 * @param {Field[]} sideNodes
 * @param {Field} keyHashOrKeyField
 * @param {Field} valueHashOrValueField
 * @param {Hasher} [hasher=PoseidonHasherFunc]
 * @return {*}  {Field}
 */
function computeRootByFieldInCircuit(sideNodes, keyHashOrKeyField, valueHashOrValueField, hasher = PoseidonHasherFunc) {
    let currentHash = valueHashOrValueField;
    const pathBits = keyHashOrKeyField.toBits(SMT_DEPTH);
    for (let i = SMT_DEPTH - 1; i >= 0; i--) {
        let node = sideNodes[i];
        let currentValue = Provable.if(pathBits[i], Provable.Array(Field, 2), [node, currentHash], [currentHash, node]);
        currentHash = hasher(currentValue);
    }
    return currentHash;
}
