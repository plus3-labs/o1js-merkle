import { Bool, Circuit, Field, Struct } from 'o1js';
import { EMPTY_VALUE, RIGHT, SMT_DEPTH } from '../constant.js';
import { defaultNodes } from '../default_nodes.js';
import { PoseidonHasherFunc } from '../model.js';
import { countSetBits, fieldToHexString, hexStringToField } from '../utils.js';
export { SparseMerkleProof, SMTUtils };
/**
 * Merkle proof CircuitValue for an element in a SparseMerkleTree.
 *
 * @class SparseMerkleProof
 * @extends {Struct({sideNodes: Circuit.array(Field, SMT_DEPTH), root: Field})}
 */
class SparseMerkleProof extends Struct({
    sideNodes: Circuit.array(Field, SMT_DEPTH),
    root: Field,
}) {
}
/**
 * Collection of utility functions for sparse merkle tree
 *
 * @class SMTUtils
 */
class SMTUtils {
    /**
     * Convert SparseCompactMerkleProof to JSONValue.
     *
     * @static
     * @param {SparseCompactMerkleProof} proof
     * @return {*}  {SparseCompactMerkleProofJSON}
     * @memberof SMTUtils
     */
    static sparseCompactMerkleProofToJson(proof) {
        let sideNodesStrArr = [];
        proof.sideNodes.forEach((v) => {
            const str = fieldToHexString(v);
            sideNodesStrArr.push(str);
        });
        return {
            sideNodes: sideNodesStrArr,
            bitMask: fieldToHexString(proof.bitMask),
            root: fieldToHexString(proof.root),
        };
    }
    /**
     * Convert JSONValue to SparseCompactMerkleProof
     *
     * @static
     * @param {SparseCompactMerkleProofJSON} jsonValue
     * @return {*}  {SparseCompactMerkleProof}
     * @memberof SMTUtils
     */
    static jsonToSparseCompactMerkleProof(jsonValue) {
        let sideNodes = [];
        jsonValue.sideNodes.forEach((v) => {
            const f = hexStringToField(v);
            sideNodes.push(f);
        });
        return {
            sideNodes,
            bitMask: hexStringToField(jsonValue.bitMask),
            root: hexStringToField(jsonValue.root),
        };
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
     * @param {V} [value]
     * @param {Provable<V>} [valueType]
     * @param {{ hasher: Hasher; hashKey: boolean; hashValue: boolean }} [options={
     *       hasher: PoseidonHasherFunc,
     *       hashKey: true,
     *       hashValue: true,
     *     }]  hasher: The hash function to use, defaults to PoseidonHasherFunc; hashKey:
     * whether to hash the key, the default is true; hashValue: whether to hash the value,
     * the default is true.
     * @return {*}  {Field}
     * @memberof SMTUtils
     */
    static computeRoot(sideNodes, key, keyType, value, valueType, options = {
        hasher: PoseidonHasherFunc,
        hashKey: true,
        hashValue: true,
    }) {
        let currentHash;
        if (value !== undefined) {
            let valueFields = valueType?.toFields(value);
            if (options.hashValue) {
                currentHash = options.hasher(valueFields);
            }
            else {
                currentHash = valueFields[0];
            }
        }
        else {
            currentHash = EMPTY_VALUE;
        }
        if (sideNodes.length !== SMT_DEPTH) {
            throw new Error('Invalid sideNodes size');
        }
        let path = null;
        let keyFields = keyType.toFields(key);
        if (options.hashKey) {
            path = options.hasher(keyFields);
        }
        else {
            path = keyFields[0];
        }
        const pathBits = path.toBits();
        for (let i = SMT_DEPTH - 1; i >= 0; i--) {
            let node = sideNodes[i];
            if (pathBits[i].toBoolean() === RIGHT) {
                currentHash = options.hasher([node, currentHash]);
            }
            else {
                currentHash = options.hasher([currentHash, node]);
            }
        }
        return currentHash;
    }
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
     * @param {{ hasher: Hasher; hashKey: boolean; hashValue: boolean }} [options={
     *       hasher: PoseidonHasherFunc,
     *       hashKey: true,
     *       hashValue: true,
     *     }]  hasher: The hash function to use, defaults to PoseidonHasherFunc; hashKey:
     * whether to hash the key, the default is true; hashValue: whether to hash the value,
     * the default is true.
     * @return {*}  {boolean}
     * @memberof SMTUtils
     */
    static checkMembership(proof, expectedRoot, key, keyType, value, valueType, options = {
        hasher: PoseidonHasherFunc,
        hashKey: true,
        hashValue: true,
    }) {
        return this.verifyProof(proof, expectedRoot, key, keyType, value, valueType, options);
    }
    /**
     * Returns true if there is no value at the index from the key
     *
     * @static
     * @template K
     * @template V
     * @param {SparseMerkleProof} proof
     * @param {Field} expectedRoot
     * @param {K} key
     * @param {Provable<K>} keyType
     * @param {{ hasher: Hasher; hashKey: boolean; hashValue: boolean }} [options={
     *       hasher: PoseidonHasherFunc,
     *       hashKey: true,
     *       hashValue: true,
     *     }]  hasher: The hash function to use, defaults to PoseidonHasherFunc; hashKey:
     * whether to hash the key, the default is true; hashValue: whether to hash the value,
     * the default is true.
     * @return {*}  {boolean}
     * @memberof SMTUtils
     */
    static checkNonMembership(proof, expectedRoot, key, keyType, options = {
        hasher: PoseidonHasherFunc,
        hashKey: true,
        hashValue: true,
    }) {
        return this.verifyProof(proof, expectedRoot, key, keyType, undefined, undefined, options);
    }
    /**
     * Verify a merkle proof
     *
     * @static
     * @template K
     * @template V
     * @param {SparseMerkleProof} proof
     * @param {Field} expectedRoot
     * @param {K} key
     * @param {Provable<K>} keyType
     * @param {V} [value]
     * @param {Provable<V>} [valueType]
     * @param {{ hasher: Hasher; hashKey: boolean; hashValue: boolean }} [options={
     *       hasher: PoseidonHasherFunc,
     *       hashKey: true,
     *       hashValue: true,
     *     }]  hasher: The hash function to use, defaults to PoseidonHasherFunc; hashKey:
     * whether to hash the key, the default is true; hashValue: whether to hash the value,
     * the default is true.
     * @return {*}  {boolean}
     * @memberof SMTUtils
     */
    static verifyProof(proof, expectedRoot, key, keyType, value, valueType, options = {
        hasher: PoseidonHasherFunc,
        hashKey: true,
        hashValue: true,
    }) {
        if (!proof.root.equals(expectedRoot).toBoolean()) {
            return false;
        }
        let newRoot = this.computeRoot(proof.sideNodes, key, keyType, value, valueType, options);
        return newRoot.equals(expectedRoot).toBoolean();
    }
    /**
     * Verify a compacted merkle proof
     *
     * @static
     * @template K
     * @template V
     * @param {SparseCompactMerkleProof} cproof
     * @param {Field} expectedRoot
     * @param {K} key
     * @param {Provable<K>} keyType
     * @param {V} [value]
     * @param {Provable<V>} [valueType]
     * @param {{ hasher: Hasher; hashKey: boolean; hashValue: boolean }} [options={
     *       hasher: PoseidonHasherFunc,
     *       hashKey: true,
     *       hashValue: true,
     *     }]
     * @return {*}  {boolean}
     * @memberof SMTUtils
     */
    static verifyCompactProof(cproof, expectedRoot, key, keyType, value, valueType, options = {
        hasher: PoseidonHasherFunc,
        hashKey: true,
        hashValue: true,
    }) {
        const proof = this.decompactProof(cproof, options.hasher);
        return this.verifyProof(proof, expectedRoot, key, keyType, value, valueType, options);
    }
    /**
     * Compact a proof to reduce its size
     *
     * @static
     * @param {SparseMerkleProof} proof
     * @param {Hasher} [hasher=PoseidonHasherFunc]
     * @return {*}  {SparseCompactMerkleProof}
     * @memberof SMTUtils
     */
    static compactProof(proof, hasher = PoseidonHasherFunc) {
        if (proof.sideNodes.length !== SMT_DEPTH) {
            throw new Error('Bad proof size');
        }
        let bits = new Array(SMT_DEPTH).fill(new Bool(false));
        let compactSideNodes = [];
        for (let i = 0; i < SMT_DEPTH; i++) {
            let node = proof.sideNodes[i];
            if (node.equals(defaultNodes(hasher)[i + 1]).toBoolean()) {
                bits[i] = new Bool(true);
            }
            else {
                compactSideNodes.push(node);
            }
        }
        return {
            sideNodes: compactSideNodes,
            bitMask: Field.fromBits(bits),
            root: proof.root,
        };
    }
    /**
     * Decompact a proof
     *
     * @static
     * @param {SparseCompactMerkleProof} proof
     * @param {Hasher} [hasher=PoseidonHasherFunc]
     * @return {*}  {SparseMerkleProof}
     * @memberof SMTUtils
     */
    static decompactProof(proof, hasher = PoseidonHasherFunc) {
        const bits = proof.bitMask.toBits();
        const proofSize = SMT_DEPTH - countSetBits(bits);
        if (proof.sideNodes.length !== proofSize) {
            throw new Error('Invalid proof size');
        }
        let decompactedSideNodes = new Array(SMT_DEPTH);
        let position = 0;
        for (let i = 0; i < SMT_DEPTH; i++) {
            if (bits[i].toBoolean()) {
                decompactedSideNodes[i] = defaultNodes(hasher)[i + 1];
            }
            else {
                decompactedSideNodes[i] = proof.sideNodes[position];
                position++;
            }
        }
        return { sideNodes: decompactedSideNodes, root: proof.root };
    }
}
