import { Field, Provable } from 'o1js';
import { Hasher } from '../model.js';
import { Store } from '../store/store.js';
import { SparseCompactMerkleProof, SparseMerkleProof } from './proofs.js';
export { SparseMerkleTree };
/**
 * Sparse Merkle Tree
 *
 * @class SparseMerkleTree
 * @template K
 * @template V
 */
declare class SparseMerkleTree<K, V> {
    /**
     * Initial empty tree root based on poseidon hash algorithm
     *
     * @static
     * @memberof SparseMerkleTree
     */
    static initialPoseidonHashRoot: import("o1js/dist/node/lib/field.js").Field;
    protected root: Field;
    protected store: Store<V>;
    protected hasher: Hasher;
    protected config: {
        hashKey: boolean;
        hashValue: boolean;
    };
    protected keyType: Provable<K>;
    protected valueType: Provable<V>;
    /**
     * Build a new sparse merkle tree
     *
     * @static
     * @template K
     * @template V
     * @param {Store<V>} store
     * @param {Provable<K>} KeyType
     * @param {Provable<V>} ValueType
     * @param {{ hasher?: Hasher; hashKey?: boolean; hashValue?: boolean }} [options={
     *       hasher: PoseidonHasherFunc,
     *       hashKey: true,
     *       hashValue: true,
     *     }]  hasher: The hash function to use, defaults to PoseidonHasherFunc; hashKey:
     * whether to hash the key, the default is true; hashValue: whether to hash the value,
     * the default is true.
     * @return {*}  {Promise<SparseMerkleTree<K, V>>}
     * @memberof SparseMerkleTree
     */
    static build<K, V>(store: Store<V>, KeyType: Provable<K>, ValueType: Provable<V>, options?: {
        hasher?: Hasher;
        hashKey?: boolean;
        hashValue?: boolean;
    }): Promise<SparseMerkleTree<K, V>>;
    /**
     * Import a sparse merkle tree via existing store
     *
     * @static
     * @template K
     * @template V
     * @param {Store<V>} store
     * @param {Provable<K>} keyType
     * @param {Provable<V>} valueType
     * @param {{ hasher?: Hasher; hashKey?: boolean; hashValue?: boolean }} [options={
     *       hasher: PoseidonHasherFunc,
     *       hashKey: true,
     *       hashValue: true,
     *     }]  hasher: The hash function to use, defaults to PoseidonHasherFunc; hashKey:
     * whether to hash the key, the default is true; hashValue: whether to hash the value,
     * the default is true.
     * @return {*}  {Promise<SparseMerkleTree<K, V>>}
     * @memberof SparseMerkleTree
     */
    static import<K, V>(store: Store<V>, keyType: Provable<K>, valueType: Provable<V>, options?: {
        hasher?: Hasher;
        hashKey?: boolean;
        hashValue?: boolean;
    }): Promise<SparseMerkleTree<K, V>>;
    private constructor();
    private getKeyField;
    /**
     * Get the root of the tree.
     *
     * @return {*}  {Field}
     * @memberof SparseMerkleTree
     */
    getRoot(): Field;
    /**
     * Check if the tree is empty.
     *
     * @return {*}  {boolean}
     * @memberof SparseMerkleTree
     */
    isEmpty(): boolean;
    /**
     * Get the depth of the tree.
     *
     * @return {*}  {number}
     * @memberof SparseMerkleTree
     */
    depth(): number;
    /**
     * Set the root of the tree.
     *
     * @param {Field} root
     * @memberof SparseMerkleTree
     */
    setRoot(root: Field): Promise<void>;
    /**
     * Get the data store of the tree.
     *
     * @return {*}  {Store<V>}
     * @memberof SparseMerkleTree
     */
    getStore(): Store<V>;
    /**
     * Get the hasher function used by the tree.
     *
     * @return {*}  {Hasher}
     * @memberof SparseMerkleTree
     */
    getHasher(): Hasher;
    /**
     * Get the value for a key from the tree.
     *
     * @param {K} key
     * @return {*}  {(Promise<V | null>)}
     * @memberof SparseMerkleTree
     */
    get(key: K): Promise<V | null>;
    /**
     * Check if the key exists in the tree.
     *
     * @param {K} key
     * @return {*}  {Promise<boolean>}
     * @memberof SparseMerkleTree
     */
    has(key: K): Promise<boolean>;
    /**
     * Clear the tree.
     *
     * @return {*}  {Promise<void>}
     * @memberof SparseMerkleTree
     */
    clear(): Promise<void>;
    /**
     * Delete a value from tree and return the new root of the tree.
     *
     * @param {K} key
     * @return {*}  {Promise<Field>}
     * @memberof SparseMerkleTree
     */
    delete(key: K): Promise<Field>;
    /**
     * Update a new value for a key in the tree and return the new root of the tree.
     *
     * @param {K} key
     * @param {V} [value]
     * @return {*}  {Promise<Field>}
     * @memberof SparseMerkleTree
     */
    update(key: K, value?: V): Promise<Field>;
    /**
     * Update multiple leaves and return the new root of the tree.
     *
     * @param {{ key: K; value?: V }[]} kvs
     * @return {*}  {Promise<Field>}
     * @memberof SparseMerkleTree
     */
    updateAll(kvs: {
        key: K;
        value?: V;
    }[]): Promise<Field>;
    /**
     * Create a merkle proof for a key against the current root.
     *
     * @param {K} key
     * @return {*}  {Promise<SparseMerkleProof>}
     * @memberof SparseMerkleTree
     */
    prove(key: K): Promise<SparseMerkleProof>;
    /**
     * Create a compacted merkle proof for a key against the current root.
     *
     * @param {K} key
     * @return {*}  {Promise<SparseCompactMerkleProof>}
     * @memberof SparseMerkleTree
     */
    proveCompact(key: K): Promise<SparseCompactMerkleProof>;
    protected digest(data: Field[]): Field;
    protected updateForRoot(root: Field, key: K, value?: V): Promise<Field>;
    protected updateWithSideNodes(sideNodes: Field[], pathNodes: Field[], oldLeafData: Field, path: Field, value?: V): Field;
    protected sideNodesForRoot(root: Field, path: Field): Promise<{
        sideNodes: Field[];
        pathNodes: Field[];
        leafData: Field;
    }>;
    protected proveForRoot(root: Field, key: K): Promise<SparseMerkleProof>;
}
