import { Field, Provable } from 'o1js';
import { Hasher } from '../model.js';
import { Store } from '../store/store.js';
import { CompactSparseMerkleProof, CSparseCompactMerkleProof } from './proofs.js';
import { TreeHasher } from './tree_hasher.js';
export { CompactSparseMerkleTree };
/**
 * Compact Sparse Merkle Tree
 *
 * @class CompactSparseMerkleTree
 * @template K
 * @template V
 */
declare class CompactSparseMerkleTree<K, V> {
    protected th: TreeHasher<K, V>;
    protected store: Store<V>;
    protected root: Field;
    protected config: {
        hashKey: boolean;
        hashValue: boolean;
    };
    protected keyType: Provable<K>;
    protected valueType: Provable<V>;
    /**
     * Creates an instance of CompactSparseMerkleTree.
     * @param {Store<V>} store
     * @param {Provable<K>} keyType
     * @param {Provable<V>} valueType
     * @param {Field} [root]
     * @param {{ hasher?: Hasher; hashKey?: boolean; hashValue?: boolean }} [options={
     *       hasher: PoseidonHasherFunc,
     *       hashKey: true,
     *       hashValue: true,
     *     }]  hasher: The hash function to use, defaults to PoseidonHasherFunc; hashKey:
     * whether to hash the key, the default is true; hashValue: whether to hash the value,
     * the default is true.
     * @memberof CompactSparseMerkleTree
     */
    constructor(store: Store<V>, keyType: Provable<K>, valueType: Provable<V>, root?: Field, options?: {
        hasher?: Hasher;
        hashKey?: boolean;
        hashValue?: boolean;
    });
    /**
     * Import a compacted sparse merkle tree
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
     * @return {*}  {Promise<CompactSparseMerkleTree<K, V>>}
     * @memberof CompactSparseMerkleTree
     */
    static import<K, V>(store: Store<V>, keyType: Provable<K>, valueType: Provable<V>, options?: {
        hasher?: Hasher;
        hashKey?: boolean;
        hashValue?: boolean;
    }): Promise<CompactSparseMerkleTree<K, V>>;
    protected getKeyField(key: K): Field;
    /**
     * Get the root of the tree.
     *
     * @return {*}  {Field}
     * @memberof CompactSparseMerkleTree
     */
    getRoot(): Field;
    /**
     * Get the tree hasher used by the tree.
     *
     * @return {*}  {TreeHasher<K, V>}
     * @memberof CompactSparseMerkleTree
     */
    getTreeHasher(): TreeHasher<K, V>;
    /**
     * Get the data store of the tree.
     *
     * @return {*}  {Store<V>}
     * @memberof CompactSparseMerkleTree
     */
    getStore(): Store<V>;
    /**
     * Set the root of the tree.
     *
     * @param {Field} root
     * @return {*}  {Promise<void>}
     * @memberof CompactSparseMerkleTree
     */
    setRoot(root: Field): Promise<void>;
    /**
     * Get the depth of the tree.
     *
     * @return {*}  {number}
     * @memberof CompactSparseMerkleTree
     */
    depth(): number;
    /**
     * Clear the tree.
     *
     * @return {*}  {Promise<void>}
     * @memberof CompactSparseMerkleTree
     */
    clear(): Promise<void>;
    /**
     * Get the value for a key from the tree.
     *
     * @param {K} key
     * @return {*}  {(Promise<V | null>)}
     * @memberof CompactSparseMerkleTree
     */
    get(key: K): Promise<V | null>;
    /**
     * Check if the key exists in the tree.
     *
     * @param {K} key
     * @return {*}  {Promise<boolean>}
     * @memberof CompactSparseMerkleTree
     */
    has(key: K): Promise<boolean>;
    /**
     * Update a new value for a key in the tree and return the new root of the tree.
     *
     * @param {K} key
     * @param {V} [value]
     * @return {*}  {Promise<Field>}
     * @memberof CompactSparseMerkleTree
     */
    update(key: K, value?: V): Promise<Field>;
    /**
     * Update multiple leaves and return the new root of the tree.
     *
     * @param {{ key: K; value?: V }[]} kvs
     * @return {*}  {Promise<Field>}
     * @memberof CompactSparseMerkleTree
     */
    updateAll(kvs: {
        key: K;
        value?: V;
    }[]): Promise<Field>;
    /**
     * Delete a value from tree and return the new root of the tree.
     *
     * @param {K} key
     * @return {*}  {Promise<Field>}
     * @memberof CompactSparseMerkleTree
     */
    delete(key: K): Promise<Field>;
    /**
     * Create a merkle proof for a key against the current root.
     *
     * @param {K} key
     * @return {*}  {Promise<CSparseMerkleProof>}
     * @memberof CompactSparseMerkleTree
     */
    prove(key: K): Promise<CompactSparseMerkleProof>;
    /**
     * Create an updatable Merkle proof for a key against the current root.
     *
     * @param {K} key
     * @return {*}  {Promise<CSparseMerkleProof>}
     * @memberof CompactSparseMerkleTree
     */
    proveUpdatable(key: K): Promise<CompactSparseMerkleProof>;
    /**
     * Create a compacted merkle proof for a key against the current root.
     *
     * @param {K} key
     * @return {*}  {Promise<CSparseCompactMerkleProof>}
     * @memberof CompactSparseMerkleTree
     */
    proveCompact(key: K): Promise<CSparseCompactMerkleProof>;
    private proveCompactForRoot;
    private doProveForRoot;
    private updateForRoot;
    private updateWithSideNodes;
    private deleteWithSideNodes;
    private sideNodesForRoot;
}
