import { Bool, CircuitValue, Field, } from 'o1js';
import { EMPTY_VALUE, RIGHT } from '../constant.js';
import { defaultNodes } from '../default_nodes.js';
import { PoseidonHasherFunc } from '../model.js';
import { countSetBits, fieldToHexString, hexStringToField } from '../utils.js';
import { ProvableMerkleTreeUtils } from './verify_circuit.js';
export { BaseMerkleProof, MerkleTreeUtils };
/**
 *  Merkle proof CircuitValue for an element in a MerkleTree.
 *
 * @class BaseMerkleProof
 * @extends {CircuitValue}
 */
class BaseMerkleProof extends CircuitValue {
    height() {
        return this.constructor.height;
    }
    constructor(root, sideNodes) {
        super();
        if (sideNodes.length !== this.height()) {
            throw Error(`The Length of sideNodes ${sideNodes.length} doesn't match static tree height ${this.height()}`);
        }
        this.root = root;
        this.sideNodes = sideNodes;
    }
}
/**
 * Collection of utility functions for merkle tree
 *
 * @class MerkleTreeUtils
 */
class MerkleTreeUtils {
    /**
     * Compact a merkle proof to reduce its size
     *
     * @static
     * @param {BaseMerkleProof} proof
     * @param {Hasher} [hasher=PoseidonHasherFunc]
     * @return {*}  {CompactMerkleProof}
     * @memberof MerkleTreeUtils
     */
    static compactMerkleProof(proof, hasher = PoseidonHasherFunc) {
        const h = proof.height();
        if (proof.sideNodes.length !== h) {
            throw new Error('Bad proof size');
        }
        let bits = new Array(h).fill(new Bool(false));
        let compactSideNodes = [];
        for (let i = 0; i < h; i++) {
            let node = proof.sideNodes[i];
            if (node.equals(defaultNodes(hasher, h)[i + 1]).toBoolean()) {
                bits[i] = new Bool(true);
            }
            else {
                compactSideNodes.push(node);
            }
        }
        return {
            height: h,
            root: proof.root,
            sideNodes: compactSideNodes,
            bitMask: Field.fromBits(bits),
        };
    }
    /**
     * Decompact a CompactMerkleProof.
     *
     * @static
     * @param {CompactMerkleProof} proof
     * @param {Hasher} [hasher=PoseidonHasherFunc]
     * @return {*}  {BaseMerkleProof}
     * @memberof MerkleTreeUtils
     */
    static decompactMerkleProof(proof, hasher = PoseidonHasherFunc) {
        const h = proof.height;
        const bits = proof.bitMask.toBits();
        const proofSize = h - countSetBits(bits);
        if (proof.sideNodes.length !== proofSize) {
            throw new Error('Invalid proof size');
        }
        let decompactedSideNodes = new Array(h);
        let position = 0;
        for (let i = 0; i < h; i++) {
            if (bits[i].toBoolean()) {
                decompactedSideNodes[i] = defaultNodes(hasher, h)[i + 1];
            }
            else {
                decompactedSideNodes[i] = proof.sideNodes[position];
                position++;
            }
        }
        class MerkleProof_ extends ProvableMerkleTreeUtils.MerkleProof(h) {
        }
        return new MerkleProof_(proof.root, decompactedSideNodes);
    }
    /**
     * Convert CompactMerkleProof to JSONValue.
     *
     * @static
     * @param {CompactMerkleProof} proof
     * @return {*}  {CompactMerkleProofJSON}
     * @memberof MerkleTreeUtils
     */
    static compactMerkleProofToJson(proof) {
        let sideNodesStrArr = proof.sideNodes.map((v) => fieldToHexString(v));
        return {
            height: proof.height,
            root: fieldToHexString(proof.root),
            sideNodes: sideNodesStrArr,
            bitMask: fieldToHexString(proof.bitMask),
        };
    }
    /**
     * Convert JSONValue to CompactMerkleProof
     *
     * @static
     * @param {CompactMerkleProofJSON} jsonValue
     * @return {*}  {CompactMerkleProof}
     * @memberof MerkleTreeUtils
     */
    static jsonToCompactMerkleProof(jsonValue) {
        let sideNodes = jsonValue.sideNodes.map((v) => hexStringToField(v));
        return {
            height: jsonValue.height,
            root: hexStringToField(jsonValue.root),
            sideNodes,
            bitMask: hexStringToField(jsonValue.bitMask),
        };
    }
    /**
     * Calculate new root based on value. Note: This method cannot be executed in a circuit.
     *
     * @static
     * @template V
     * @param {BaseMerkleProof} proof
     * @param {bigint} index
     * @param {V} [value]
     * @param {Provable<V>} [valueType]
     * @param {{ hasher: Hasher; hashValue: boolean }} [options={
     *       hasher: PoseidonHasherFunc,
     *       hashValue: true,
     *     }]  hasher: The hash function to use, defaults to PoseidonHasherFunc;
     * hashValue: whether to hash the value, the default is true.
     * @return {*}  {Field}
     * @memberof MerkleTreeUtils
     */
    static computeRoot(proof, index, value, valueType, options = {
        hasher: PoseidonHasherFunc,
        hashValue: true,
    }) {
        let currentHash;
        if (value !== undefined) {
            let valueFs = valueType?.toFields(value);
            if (options.hashValue) {
                currentHash = options.hasher(valueFs);
            }
            else {
                if (valueFs.length > 1) {
                    throw new Error(`The length of value fields is greater than 1, the value needs to be hashed before it can be processed, option 'hashValue' must be set to true`);
                }
                currentHash = valueFs[0];
            }
        }
        else {
            currentHash = EMPTY_VALUE;
        }
        let h = proof.height();
        if (proof.sideNodes.length !== h) {
            throw new Error('Invalid sideNodes size');
        }
        const path = Field(index);
        const pathBits = path.toBits(h);
        for (let i = h - 1; i >= 0; i--) {
            let node = proof.sideNodes[i];
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
     * @template V
     * @param {BaseMerkleProof} proof
     * @param {Field} expectedRoot
     * @param {bigint} index
     * @param {V} value
     * @param {Provable<V>} valueType
     * @param {{ hasher: Hasher; hashValue: boolean }} [options={
     *       hasher: PoseidonHasherFunc,
     *       hashValue: true,
     *     }]  hasher: The hash function to use, defaults to PoseidonHasherFunc;
     * hashValue: whether to hash the value, the default is true.
     * @return {*}  {boolean}
     * @memberof MerkleTreeUtils
     */
    static checkMembership(proof, expectedRoot, index, value, valueType, options = {
        hasher: PoseidonHasherFunc,
        hashValue: true,
    }) {
        return this.verifyProof(proof, expectedRoot, index, value, valueType, options);
    }
    /**
     * Returns true if there is no value at the index from the key
     *
     * @static
     * @template V
     * @param {BaseMerkleProof} proof
     * @param {Field} expectedRoot
     * @param {bigint} index
     * @param {Hasher} [hasher=PoseidonHasherFunc]
     * @return {*}  {boolean}
     * @memberof MerkleTreeUtils
     */
    static checkNonMembership(proof, expectedRoot, index, hasher = PoseidonHasherFunc) {
        return this.verifyProof(proof, expectedRoot, index, undefined, undefined, {
            hasher,
            hashValue: true,
        });
    }
    /**
     * Verify the merkle proof.
     *
     * @static
     * @template V
     * @param {BaseMerkleProof} proof
     * @param {Field} expectedRoot
     * @param {bigint} index
     * @param {V} [value]
     * @param {Provable<V>} [valueType]
     * @param {{ hasher: Hasher; hashValue: boolean }} [options={
     *       hasher: PoseidonHasherFunc,
     *       hashValue: true,
     *     }]  hasher: The hash function to use, defaults to PoseidonHasherFunc;
     * hashValue: whether to hash the value, the default is true.
     * @return {*}  {boolean}
     * @memberof MerkleTreeUtils
     */
    static verifyProof(proof, expectedRoot, index, value, valueType, options = {
        hasher: PoseidonHasherFunc,
        hashValue: true,
    }) {
        if (!proof.root.equals(expectedRoot).toBoolean()) {
            return false;
        }
        let currentRoot = this.computeRoot(proof, index, value, valueType, options);
        return currentRoot.equals(expectedRoot).toBoolean();
    }
    /**
     *  Verify the merkle proof by index and valueHashOrValueField
     *
     * @static
     * @param {BaseMerkleProof} proof
     * @param {Field} expectedRoot
     * @param {bigint} index
     * @param {Field} valueHashOrValueField
     * @param {Hasher} [hasher=PoseidonHasherFunc]
     * @return {*}  {boolean}
     * @memberof MerkleTreeUtils
     */
    static verifyProofByField(proof, expectedRoot, index, valueHashOrValueField, hasher = PoseidonHasherFunc) {
        if (!proof.root.equals(expectedRoot).toBoolean()) {
            return false;
        }
        let currentRoot = this.computeRootByField(proof, index, valueHashOrValueField, hasher);
        return currentRoot.equals(expectedRoot).toBoolean();
    }
    /**
     * Verify the merkle proof by index and valueHashOrValueField, return result and updates
     *
     * @static
     * @param {BaseMerkleProof} proof
     * @param {Field} expectedRoot
     * @param {bigint} index
     * @param {Field} valueHashOrValueField
     * @param {Hasher} [hasher=PoseidonHasherFunc]
     * @return {*}  {{ ok: boolean; updates: [Field, Field[]][] }}
     * @memberof MerkleTreeUtils
     */
    static verifyProofByFieldWithUpdates(proof, expectedRoot, index, valueHashOrValueField, hasher = PoseidonHasherFunc) {
        if (!proof.root.equals(expectedRoot).toBoolean()) {
            return { ok: false, updates: [] };
        }
        let { actualRoot, updates } = this.computeRootByFieldWithUpdates(proof, index, valueHashOrValueField, hasher);
        return { ok: actualRoot.equals(expectedRoot).toBoolean(), updates };
    }
    /**
     * Compute new merkle root by index and valueHashOrValueField
     *
     * @static
     * @param {BaseMerkleProof} proof
     * @param {bigint} index
     * @param {Field} valueHashOrValueField
     * @param {Hasher} [hasher=PoseidonHasherFunc]
     * @return {*}  {Field}
     * @memberof MerkleTreeUtils
     */
    static computeRootByField(proof, index, valueHashOrValueField, hasher = PoseidonHasherFunc) {
        let h = proof.height();
        let currentHash = valueHashOrValueField;
        if (proof.sideNodes.length !== h) {
            throw new Error('Invalid proof');
        }
        const path = Field(index);
        const pathBits = path.toBits(h);
        for (let i = h - 1; i >= 0; i--) {
            let node = proof.sideNodes[i];
            let currentValue = [];
            if (pathBits[i].toBoolean()) {
                currentValue = [node, currentHash];
            }
            else {
                currentValue = [currentHash, node];
            }
            currentHash = hasher(currentValue);
        }
        return currentHash;
    }
    /**
     * Compute new merkle root by index and valueHashOrValueField, return new root and updates.
     *
     * @static
     * @param {BaseMerkleProof} proof
     * @param {bigint} index
     * @param {Field} valueHashOrValueField
     * @param {Hasher} [hasher=PoseidonHasherFunc]
     * @return {*}  {{ actualRoot: Field; updates: [Field, Field[]][] }}
     * @memberof MerkleTreeUtils
     */
    static computeRootByFieldWithUpdates(proof, index, valueHashOrValueField, hasher = PoseidonHasherFunc) {
        let h = proof.height();
        let currentHash = valueHashOrValueField;
        let updates = [];
        updates.push([currentHash, [currentHash]]);
        const path = Field(index);
        const pathBits = path.toBits(h);
        for (let i = h - 1; i >= 0; i--) {
            let node = proof.sideNodes[i];
            let currentValue = [];
            if (pathBits[i].toBoolean()) {
                currentValue = [node, currentHash];
            }
            else {
                currentValue = [currentHash, node];
            }
            currentHash = hasher(currentValue);
            updates.push([currentHash, currentValue]);
        }
        return { actualRoot: currentHash, updates };
    }
}
