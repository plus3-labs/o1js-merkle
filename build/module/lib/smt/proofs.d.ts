import { Field, Provable } from 'o1js';
import { Hasher } from '../model.js';
export { SparseMerkleProof, SMTUtils };
export type { SparseCompactMerkleProof, SparseCompactMerkleProofJSON };
declare const SparseMerkleProof_base: (new (value: {
    sideNodes: import("o1js/dist/node/lib/field.js").Field[];
    root: import("o1js/dist/node/lib/field.js").Field;
}) => {
    sideNodes: import("o1js/dist/node/lib/field.js").Field[];
    root: import("o1js/dist/node/lib/field.js").Field;
}) & {
    _isStruct: true;
} & import("o1js/dist/node/snarky.js").ProvablePure<{
    sideNodes: import("o1js/dist/node/lib/field.js").Field[];
    root: import("o1js/dist/node/lib/field.js").Field;
}> & {
    toInput: (x: {
        sideNodes: import("o1js/dist/node/lib/field.js").Field[];
        root: import("o1js/dist/node/lib/field.js").Field;
    }) => {
        fields?: import("o1js/dist/node/lib/field.js").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        sideNodes: import("o1js/dist/node/lib/field.js").Field[];
        root: import("o1js/dist/node/lib/field.js").Field;
    }) => {
        sideNodes: string[];
        root: string;
    };
    fromJSON: (x: {
        sideNodes: string[];
        root: string;
    }) => {
        sideNodes: import("o1js/dist/node/lib/field.js").Field[];
        root: import("o1js/dist/node/lib/field.js").Field;
    };
    empty: () => {
        sideNodes: import("o1js/dist/node/lib/field.js").Field[];
        root: import("o1js/dist/node/lib/field.js").Field;
    };
};
/**
 * Merkle proof CircuitValue for an element in a SparseMerkleTree.
 *
 * @class SparseMerkleProof
 * @extends {Struct({sideNodes: Circuit.array(Field, SMT_DEPTH), root: Field})}
 */
declare class SparseMerkleProof extends SparseMerkleProof_base {
}
/**
 * Compacted Merkle proof for an element in a SparseMerkleTree
 *
 * @interface SparseCompactMerkleProof
 */
interface SparseCompactMerkleProof {
    sideNodes: Field[];
    bitMask: Field;
    root: Field;
}
/**
 * A type used to support serialization to json for SparseCompactMerkleProof.
 *
 * @interface SparseCompactMerkleProofJSON
 */
interface SparseCompactMerkleProofJSON {
    sideNodes: string[];
    bitMask: string;
    root: string;
}
/**
 * Collection of utility functions for sparse merkle tree
 *
 * @class SMTUtils
 */
declare class SMTUtils {
    /**
     * Convert SparseCompactMerkleProof to JSONValue.
     *
     * @static
     * @param {SparseCompactMerkleProof} proof
     * @return {*}  {SparseCompactMerkleProofJSON}
     * @memberof SMTUtils
     */
    static sparseCompactMerkleProofToJson(proof: SparseCompactMerkleProof): SparseCompactMerkleProofJSON;
    /**
     * Convert JSONValue to SparseCompactMerkleProof
     *
     * @static
     * @param {SparseCompactMerkleProofJSON} jsonValue
     * @return {*}  {SparseCompactMerkleProof}
     * @memberof SMTUtils
     */
    static jsonToSparseCompactMerkleProof(jsonValue: SparseCompactMerkleProofJSON): SparseCompactMerkleProof;
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
    static computeRoot<K, V>(sideNodes: Field[], key: K, keyType: Provable<K>, value?: V, valueType?: Provable<V>, options?: {
        hasher: Hasher;
        hashKey: boolean;
        hashValue: boolean;
    }): Field;
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
    static checkMembership<K, V>(proof: SparseMerkleProof, expectedRoot: Field, key: K, keyType: Provable<K>, value: V, valueType: Provable<V>, options?: {
        hasher: Hasher;
        hashKey: boolean;
        hashValue: boolean;
    }): boolean;
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
    static checkNonMembership<K, V>(proof: SparseMerkleProof, expectedRoot: Field, key: K, keyType: Provable<K>, options?: {
        hasher: Hasher;
        hashKey: boolean;
        hashValue: boolean;
    }): boolean;
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
    static verifyProof<K, V>(proof: SparseMerkleProof, expectedRoot: Field, key: K, keyType: Provable<K>, value?: V, valueType?: Provable<V>, options?: {
        hasher: Hasher;
        hashKey: boolean;
        hashValue: boolean;
    }): boolean;
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
    static verifyCompactProof<K, V>(cproof: SparseCompactMerkleProof, expectedRoot: Field, key: K, keyType: Provable<K>, value?: V, valueType?: Provable<V>, options?: {
        hasher: Hasher;
        hashKey: boolean;
        hashValue: boolean;
    }): boolean;
    /**
     * Compact a proof to reduce its size
     *
     * @static
     * @param {SparseMerkleProof} proof
     * @param {Hasher} [hasher=PoseidonHasherFunc]
     * @return {*}  {SparseCompactMerkleProof}
     * @memberof SMTUtils
     */
    static compactProof(proof: SparseMerkleProof, hasher?: Hasher): SparseCompactMerkleProof;
    /**
     * Decompact a proof
     *
     * @static
     * @param {SparseCompactMerkleProof} proof
     * @param {Hasher} [hasher=PoseidonHasherFunc]
     * @return {*}  {SparseMerkleProof}
     * @memberof SMTUtils
     */
    static decompactProof(proof: SparseCompactMerkleProof, hasher?: Hasher): SparseMerkleProof;
}
