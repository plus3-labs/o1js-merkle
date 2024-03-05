import { CircuitValue, Field, Provable } from 'o1js';
import { Hasher } from '../model.js';
export { BaseMerkleProof, MerkleTreeUtils };
export type { CompactMerkleProof, CompactMerkleProofJSON };
/**
 *  Merkle proof CircuitValue for an element in a MerkleTree.
 *
 * @class BaseMerkleProof
 * @extends {CircuitValue}
 */
declare class BaseMerkleProof extends CircuitValue {
    static height: number;
    root: Field;
    sideNodes: Field[];
    height(): number;
    constructor(root: Field, sideNodes: Field[]);
}
/**
 * Compacted Merkle proof for an element in a MerkleTree
 *
 * @interface CompactMerkleProof
 */
interface CompactMerkleProof {
    height: number;
    root: Field;
    sideNodes: Field[];
    bitMask: Field;
}
/**
 * A type used to support serialization to json for CompactMerkleProof.
 *
 * @interface CompactMerkleProofJSON
 */
interface CompactMerkleProofJSON {
    height: number;
    root: string;
    sideNodes: string[];
    bitMask: string;
}
/**
 * Collection of utility functions for merkle tree
 *
 * @class MerkleTreeUtils
 */
declare class MerkleTreeUtils {
    /**
     * Compact a merkle proof to reduce its size
     *
     * @static
     * @param {BaseMerkleProof} proof
     * @param {Hasher} [hasher=PoseidonHasherFunc]
     * @return {*}  {CompactMerkleProof}
     * @memberof MerkleTreeUtils
     */
    static compactMerkleProof(proof: BaseMerkleProof, hasher?: Hasher): CompactMerkleProof;
    /**
     * Decompact a CompactMerkleProof.
     *
     * @static
     * @param {CompactMerkleProof} proof
     * @param {Hasher} [hasher=PoseidonHasherFunc]
     * @return {*}  {BaseMerkleProof}
     * @memberof MerkleTreeUtils
     */
    static decompactMerkleProof(proof: CompactMerkleProof, hasher?: Hasher): BaseMerkleProof;
    /**
     * Convert CompactMerkleProof to JSONValue.
     *
     * @static
     * @param {CompactMerkleProof} proof
     * @return {*}  {CompactMerkleProofJSON}
     * @memberof MerkleTreeUtils
     */
    static compactMerkleProofToJson(proof: CompactMerkleProof): CompactMerkleProofJSON;
    /**
     * Convert JSONValue to CompactMerkleProof
     *
     * @static
     * @param {CompactMerkleProofJSON} jsonValue
     * @return {*}  {CompactMerkleProof}
     * @memberof MerkleTreeUtils
     */
    static jsonToCompactMerkleProof(jsonValue: CompactMerkleProofJSON): CompactMerkleProof;
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
    static computeRoot<V>(proof: BaseMerkleProof, index: bigint, value?: V, valueType?: Provable<V>, options?: {
        hasher: Hasher;
        hashValue: boolean;
    }): Field;
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
    static checkMembership<V>(proof: BaseMerkleProof, expectedRoot: Field, index: bigint, value: V, valueType: Provable<V>, options?: {
        hasher: Hasher;
        hashValue: boolean;
    }): boolean;
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
    static checkNonMembership<V>(proof: BaseMerkleProof, expectedRoot: Field, index: bigint, hasher?: Hasher): boolean;
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
    static verifyProof<V>(proof: BaseMerkleProof, expectedRoot: Field, index: bigint, value?: V, valueType?: Provable<V>, options?: {
        hasher: Hasher;
        hashValue: boolean;
    }): boolean;
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
    static verifyProofByField(proof: BaseMerkleProof, expectedRoot: Field, index: bigint, valueHashOrValueField: Field, hasher?: Hasher): boolean;
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
    static verifyProofByFieldWithUpdates(proof: BaseMerkleProof, expectedRoot: Field, index: bigint, valueHashOrValueField: Field, hasher?: Hasher): {
        ok: boolean;
        updates: [Field, Field[]][];
    };
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
    static computeRootByField(proof: BaseMerkleProof, index: bigint, valueHashOrValueField: Field, hasher?: Hasher): Field;
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
    static computeRootByFieldWithUpdates(proof: BaseMerkleProof, index: bigint, valueHashOrValueField: Field, hasher?: Hasher): {
        actualRoot: Field;
        updates: [Field, Field[]][];
    };
}
