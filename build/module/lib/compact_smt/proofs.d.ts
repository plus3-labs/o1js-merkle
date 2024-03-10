import { Field, Provable } from 'o1js';
import { Hasher } from '../model.js';
export { CompactSparseMerkleProof, CSMTUtils };
export type { CSparseCompactMerkleProof };
declare const CompactSparseMerkleProof_base: (new (value: {
    sideNodes: import("o1js/dist/node/lib/field.js").Field[];
    nonMembershipLeafData: import("o1js/dist/node/lib/field.js").Field[];
    siblingData: import("o1js/dist/node/lib/field.js").Field[];
    root: import("o1js/dist/node/lib/field.js").Field;
}) => {
    sideNodes: import("o1js/dist/node/lib/field.js").Field[];
    nonMembershipLeafData: import("o1js/dist/node/lib/field.js").Field[];
    siblingData: import("o1js/dist/node/lib/field.js").Field[];
    root: import("o1js/dist/node/lib/field.js").Field;
}) & {
    _isStruct: true;
} & import("o1js/dist/node/snarky.js").ProvablePure<{
    sideNodes: import("o1js/dist/node/lib/field.js").Field[];
    nonMembershipLeafData: import("o1js/dist/node/lib/field.js").Field[];
    siblingData: import("o1js/dist/node/lib/field.js").Field[];
    root: import("o1js/dist/node/lib/field.js").Field;
}> & {
    toInput: (x: {
        sideNodes: import("o1js/dist/node/lib/field.js").Field[];
        nonMembershipLeafData: import("o1js/dist/node/lib/field.js").Field[];
        siblingData: import("o1js/dist/node/lib/field.js").Field[];
        root: import("o1js/dist/node/lib/field.js").Field;
    }) => {
        fields?: import("o1js/dist/node/lib/field.js").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        sideNodes: import("o1js/dist/node/lib/field.js").Field[];
        nonMembershipLeafData: import("o1js/dist/node/lib/field.js").Field[];
        siblingData: import("o1js/dist/node/lib/field.js").Field[];
        root: import("o1js/dist/node/lib/field.js").Field;
    }) => {
        sideNodes: string[];
        nonMembershipLeafData: string[];
        siblingData: string[];
        root: string;
    };
    fromJSON: (x: {
        sideNodes: string[];
        nonMembershipLeafData: string[];
        siblingData: string[];
        root: string;
    }) => {
        sideNodes: import("o1js/dist/node/lib/field.js").Field[];
        nonMembershipLeafData: import("o1js/dist/node/lib/field.js").Field[];
        siblingData: import("o1js/dist/node/lib/field.js").Field[];
        root: import("o1js/dist/node/lib/field.js").Field;
    };
    empty: () => {
        sideNodes: import("o1js/dist/node/lib/field.js").Field[];
        nonMembershipLeafData: import("o1js/dist/node/lib/field.js").Field[];
        siblingData: import("o1js/dist/node/lib/field.js").Field[];
        root: import("o1js/dist/node/lib/field.js").Field;
    };
};
/**
 * Proof for compact sparse merkle tree
 *
 * @class CompactSparseMerkleProof
 * @extends {Struct({
 *   sideNodes: Circuit.array(Field, CSMT_DEPTH),
 *   nonMembershipLeafData: Circuit.array(Field, 3),
 *   siblingData: Circuit.array(Field, 3),
 *   root: Field,
 * })}
 */
declare class CompactSparseMerkleProof extends CompactSparseMerkleProof_base {
    constructor(value: {
        sideNodes: Field[];
        nonMembershipLeafData: Field[];
        siblingData: Field[];
        root: Field;
    });
}
/**
 * SparseCompactMerkleProof for compact sparse merkle tree
 *
 * @interface CSparseCompactMerkleProof
 */
interface CSparseCompactMerkleProof {
    sideNodes: Field[];
    nonMembershipLeafData: Field[];
    bitMask: Field;
    numSideNodes: number;
    siblingData: Field[];
    root: Field;
}
/**
 * Collection of utility functions for compact sparse merkle tree
 *
 * @class CSMTUtils
 */
declare class CSMTUtils {
    /**
     * Verify Compact Proof for Compact Sparse Merkle Tree
     *
     * @static
     * @template K
     * @template V
     * @param {CSparseCompactMerkleProof} cproof
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
     * @memberof CSMTUtils
     */
    static verifyCompactProof<K, V>(cproof: CSparseCompactMerkleProof, expectedRoot: Field, key: K, keyType: Provable<K>, value?: V, valueType?: Provable<V>, options?: {
        hasher: Hasher;
        hashKey: boolean;
        hashValue: boolean;
    }): boolean;
    /**
     * Verify a merkle proof, return result and updates.
     *
     * @static
     * @template K
     * @template V
     * @param {CompactSparseMerkleProof} proof
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
     * @return {*}  {({
     *     ok: boolean;
     *     updates: [Field, Field[]][] | null;
     *   })}
     * @memberof CSMTUtils
     */
    static verifyProofWithUpdates<K, V>(proof: CompactSparseMerkleProof, expectedRoot: Field, key: K, keyType: Provable<K>, value?: V, valueType?: Provable<V>, options?: {
        hasher: Hasher;
        hashKey: boolean;
        hashValue: boolean;
    }): {
        ok: boolean;
        updates: [Field, Field[]][] | null;
    };
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
     * @memberof CSMTUtils
     */
    static checkMemebership<K, V>(proof: CompactSparseMerkleProof, expectedRoot: Field, key: K, keyType: Provable<K>, value?: V, valueType?: Provable<V>, options?: {
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
     * @param {CompactSparseMerkleProof} proof
     * @param {Field} expectedRoot
     * @param {K} key
     * @param {Provable<K>} keyType
     * @param {{ hasher: Hasher; hashKey: boolean }} [options={
     *       hasher: PoseidonHasherFunc,
     *       hashKey: true,
     *     }]  hasher: The hash function to use, defaults to PoseidonHasherFunc;
     * hashKey: whether to hash the key, the default is true
     * @return {*}  {boolean}
     * @memberof CSMTUtils
     */
    static checkNonMemebership<K, V>(proof: CompactSparseMerkleProof, expectedRoot: Field, key: K, keyType: Provable<K>, options?: {
        hasher: Hasher;
        hashKey: boolean;
    }): boolean;
    /**
     * Verify Proof of Compact Sparse Merkle Tree
     *
     * @static
     * @template K
     * @template V
     * @param {CompactSparseMerkleProof} proof
     * @param {Field} root
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
     * @memberof CSMTUtils
     */
    static verifyProof<K, V>(proof: CompactSparseMerkleProof, root: Field, key: K, keyType: Provable<K>, value?: V, valueType?: Provable<V>, options?: {
        hasher: Hasher;
        hashKey: boolean;
        hashValue: boolean;
    }): boolean;
    /**
     * Compact proof Of Compact Sparse Merkle Tree
     *
     * @static
     * @param {CompactSparseMerkleProof} proof
     * @param {Hasher} [hasher=PoseidonHasherFunc]
     * @return {*}  {CSparseCompactMerkleProof}
     * @memberof CSMTUtils
     */
    static compactProof(proof: CompactSparseMerkleProof, hasher?: Hasher): CSparseCompactMerkleProof;
    /**
     * Decompact compact proof of Compact Sparse Merkle Tree
     *
     * @static
     * @param {CSparseCompactMerkleProof} proof
     * @param {Hasher} [hasher=PoseidonHasherFunc]
     * @return {*}  {CompactSparseMerkleProof}
     * @memberof CSMTUtils
     */
    static decompactProof(proof: CSparseCompactMerkleProof, hasher?: Hasher): CompactSparseMerkleProof;
}
