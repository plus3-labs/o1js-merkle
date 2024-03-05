import { Field, Provable } from 'o1js';
import { Hasher } from '../model.js';
import { Store } from '../store/store.js';
import { BaseMerkleProof, CompactMerkleProof } from './proofs.js';
export { MerkleTree };
/**
 * Merkle Tree.
 *
 * @class MerkleTree
 * @template V
 */
declare class MerkleTree<V> {
    protected root: Field;
    protected store: Store<V>;
    protected hasher: Hasher;
    protected readonly height: number;
    protected readonly maxNumIndex: bigint;
    protected readonly hashValue: boolean;
    protected valueType: Provable<V>;
    /**
     * Build a new merkle tree.
     *
     * @static
     * @template V
     * @param {Store<V>} store
     * @param {number} height
     * @param {Provable<V>} valueType
     * @param {{ hasher?: Hasher; hashValue?: boolean }} [options={
     *       hasher: PoseidonHasherFunc,
     *       hashValue: true,
     *     }]  hasher: The hash function to use, defaults to PoseidonHasherFunc;
     * hashValue: whether to hash the value, the default is true.
     * @return {*}  {Promise<MerkleTree<V>>}
     * @memberof MerkleTree
     */
    static build<V>(store: Store<V>, height: number, valueType: Provable<V>, options?: {
        hasher?: Hasher;
        hashValue?: boolean;
    }): Promise<MerkleTree<V>>;
    /**
     * Import a merkle tree via existing store.
     *
     * @static
     * @template V
     * @param {Store<V>} store
     * @param {number} height
     * @param {Provable<V>} valueType
     * @param {{ hasher?: Hasher; hashValue?: boolean }} [options={
     *       hasher: PoseidonHasherFunc,
     *       hashValue: true,
     *     }]  hasher: The hash function to use, defaults to PoseidonHasherFunc;
     * hashValue: whether to hash the value, the default is true.
     * @return {*}  {Promise<MerkleTree<V>>}
     * @memberof MerkleTree
     */
    static import<V>(store: Store<V>, height: number, valueType: Provable<V>, options?: {
        hasher?: Hasher;
        hashValue?: boolean;
    }): Promise<MerkleTree<V>>;
    private constructor();
    /**
     * Get the root of the tree.
     *
     * @return {*}  {Field}
     * @memberof MerkleTree
     */
    getRoot(): Field;
    /**
     * Check if the tree is empty.
     *
     * @return {*}  {boolean}
     * @memberof MerkleTree
     */
    isEmpty(): boolean;
    /**
     * Get the depth of the tree.
     *
     * @return {*}  {number}
     * @memberof MerkleTree
     */
    depth(): number;
    /**
     * Set the root of the tree.
     *
     * @param {Field} root
     * @memberof MerkleTree
     */
    setRoot(root: Field): Promise<void>;
    /**
     * Get the data store of the tree.
     *
     * @return {*}  {Store<V>}
     * @memberof MerkleTree
     */
    getStore(): Store<V>;
    /**
     * Get the hasher function used by the tree.
     *
     * @return {*}  {Hasher}
     * @memberof MerkleTree
     */
    getHasher(): Hasher;
    /**
     * Get the value for an index from the tree.
     *
     * @param {bigint} index
     * @return {*}  {(Promise<V | null>)}
     * @memberof MerkleTree
     */
    get(index: bigint): Promise<V | null>;
    /**
     * Check if the index exists in the tree.
     *
     * @param {bigint} index
     * @return {*}  {Promise<boolean>}
     * @memberof MerkleTree
     */
    has(index: bigint): Promise<boolean>;
    /**
     * Clear the tree.
     *
     * @return {*}  {Promise<void>}
     * @memberof MerkleTree
     */
    clear(): Promise<void>;
    /**
     * Delete a value from tree and return the new root of the tree.
     *
     * @param {bigint} index
     * @return {*}  {Promise<Field>}
     * @memberof MerkleTree
     */
    delete(index: bigint): Promise<Field>;
    /**
     * Update a new value for an index in the tree and return the new root of the tree.
     *
     * @param {bigint} index
     * @param {V} [value]
     * @return {*}  {Promise<Field>}
     * @memberof MerkleTree
     */
    update(index: bigint, value?: V): Promise<Field>;
    /**
     * Update multiple leaves and return the new root of the tree.
     *
     * @param {{ index: bigint; value?: V }[]} ivs
     * @return {*}  {Promise<Field>}
     * @memberof MerkleTree
     */
    updateAll(ivs: {
        index: bigint;
        value?: V;
    }[]): Promise<Field>;
    /**
     * Create a merkle proof for an index against the current root.
     *
     * @param {bigint} index
     * @return {*}  {Promise<BaseMerkleProof>}
     * @memberof MerkleTree
     */
    prove(index: bigint): Promise<BaseMerkleProof>;
    /**
     * Create a compacted merkle proof for an index against the current root.
     *
     * @param {bigint} index
     * @return {*}  {Promise<CompactMerkleProof>}
     * @memberof MerkleTree
     */
    proveCompact(index: bigint): Promise<CompactMerkleProof>;
    protected digest(data: Field[]): Field;
    protected updateForRoot(root: Field, key: bigint, value?: V): Promise<Field>;
    protected updateWithSideNodes(sideNodes: Field[], pathNodes: Field[], oldLeafData: Field, path: Field, value?: V): Field;
    protected sideNodesForRoot(root: Field, path: Field): Promise<{
        sideNodes: Field[];
        pathNodes: Field[];
        leafData: Field;
    }>;
    protected proveForRoot(root: Field, key: bigint): Promise<BaseMerkleProof>;
}
