import { Field, Provable } from 'o1js';
import { Hasher } from '../model.js';
import { BaseMerkleProof } from './proofs.js';
export { DeepMerkleSubTree };
/**
 * DeepMerkleSubTree is a deep merkle subtree for working on only a few leafs.
 *
 * @class DeepMerkleSubTree
 * @template V
 */
declare class DeepMerkleSubTree<V> {
    private nodeStore;
    private valueStore;
    private root;
    private height;
    private hasher;
    private hashValue;
    private valueType;
    /**
     * Creates an instance of DeepMerkleSubTree.
     * @param {Field} root
     * @param {number} height
     * @param {Provable<V>} valueType
     * @param {{ hasher: Hasher; hashValue: boolean }} [options={
     *       hasher: PoseidonHasherFunc,
     *       hashValue: true,
     *     }]  hasher: The hash function to use, defaults to PoseidonHasherFunc;
     * hashValue: whether to hash the value, the default is true.
     * @memberof DeepMerkleSubTree
     */
    constructor(root: Field, height: number, valueType: Provable<V>, options?: {
        hasher: Hasher;
        hashValue: boolean;
    });
    /**
     * Get current root.
     *
     * @return {*}  {Field}
     * @memberof DeepMerkleSubTree
     */
    getRoot(): Field;
    /**
     * Get height of the tree.
     *
     * @return {*}  {number}
     * @memberof DeepMerkleSubTree
     */
    getHeight(): number;
    private getValueField;
    /**
     * Check whether there is a corresponding key and value in the tree
     *
     * @param {bigint} index
     * @param {V} value
     * @return {*}  {boolean}
     * @memberof DeepMerkleSubTree
     */
    has(index: bigint, value: V): boolean;
    /**
     * Add a branch to the tree, a branch is generated by smt.prove.
     *
     * @param {BaseMerkleProof} proof
     * @param {bigint} index
     * @param {V} [value]
     * @param {boolean} [ignoreInvalidProof=false]
     * @return {*}
     * @memberof DeepMerkleSubTree
     */
    addBranch(proof: BaseMerkleProof, index: bigint, value?: V, ignoreInvalidProof?: boolean): void;
    /**
     * Create a merkle proof for a key against the current root.
     *
     * @param {bigint} index
     * @return {*}  {BaseMerkleProof}
     * @memberof DeepMerkleSubTree
     */
    prove(index: bigint): BaseMerkleProof;
    /**
     * Update a new value for a key in the tree and return the new root of the tree.
     *
     * @param {bigint} index
     * @param {V} [value]
     * @return {*}  {Field}
     * @memberof DeepMerkleSubTree
     */
    update(index: bigint, value?: V): Field;
}