import { Bool, Field, Provable } from 'o1js';
import { Hasher } from '../model.js';
import { BaseMerkleProof } from './proofs.js';
export { ProvableMerkleTreeUtils };
/**
 * Collection of utility functions for merkle tree in the circuit.
 *
 * @class ProvableMerkleTreeUtils
 */
declare class ProvableMerkleTreeUtils {
    /**
     * Empty value for merkle tree
     *
     * @static
     * @memberof ProvableMerkleTreeUtils
     */
    static EMPTY_VALUE: import("o1js/dist/node/lib/field.js").Field;
    /**
     * Create a meerkle proof circuit value type based on the specified tree height.
     *
     * @static
     * @param {number} height
     * @return {*}  {typeof BaseMerkleProof}
     * @memberof ProvableMerkleTreeUtils
     */
    static MerkleProof(height: number): typeof BaseMerkleProof;
    /**
     * Calculate new root based on index and value.
     *
     * @static
     * @template V
     * @param {BaseMerkleProof} proof
     * @param {Field} index
     * @param {V} value
     * @param {Provable<V>} valueType
     * @param {{ hasher?: Hasher; hashValue: boolean }} [options={
     *       hasher: PoseidonHasherFunc,
     *       hashValue: true,
     *     }]  hasher: The hash function to use, defaults to PoseidonHasherFunc;
     * hashValue: whether to hash the value, the default is true.
     * @return {*}  {Field}
     * @memberof ProvableMerkleTreeUtils
     */
    static computeRoot<V>(proof: BaseMerkleProof, index: Field, value: V, valueType: Provable<V>, options?: {
        hasher?: Hasher;
        hashValue: boolean;
    }): Field;
    /**
     * Returns true if the value is in the tree and it is at the index from the key
     *
     * @static
     * @template V
     * @param {BaseMerkleProof} proof
     * @param {Field} expectedRoot
     * @param {Field} index
     * @param {V} value
     * @param {Provable<V>} valueType
     * @param {{ hasher?: Hasher; hashValue: boolean }} [options={
     *       hasher: PoseidonHasherFunc,
     *       hashValue: true,
     *     }]  hasher: The hash function to use, defaults to PoseidonHasherFunc;
     * hashValue: whether to hash the value, the default is true.
     * @return {*}  {Bool}
     * @memberof ProvableMerkleTreeUtils
     */
    static checkMembership<V>(proof: BaseMerkleProof, expectedRoot: Field, index: Field, value: V, valueType: Provable<V>, options?: {
        hasher?: Hasher;
        hashValue: boolean;
    }): Bool;
    /**
     * Returns true if there is no value at the index from the key
     *
     * @static
     * @param {BaseMerkleProof} proof
     * @param {Field} expectedRoot
     * @param {Field} index
     * @param {Hasher} [hasher=PoseidonHasherFunc]
     * @return {*}  {Bool}
     * @memberof ProvableMerkleTreeUtils
     */
    static checkNonMembership(proof: BaseMerkleProof, expectedRoot: Field, index: Field, hasher?: Hasher): Bool;
}
