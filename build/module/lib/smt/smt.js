import { Field } from 'o1js';
import { EMPTY_VALUE, RIGHT, SMT_DEPTH } from '../constant.js';
import { defaultNodes } from '../default_nodes.js';
import { PoseidonHasherFunc } from '../model.js';
import { SMTUtils, } from './proofs.js';
export { SparseMerkleTree };
/**
 * Sparse Merkle Tree
 *
 * @class SparseMerkleTree
 * @template K
 * @template V
 */
class SparseMerkleTree {
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
    static async build(store, KeyType, ValueType, options = {
        hasher: PoseidonHasherFunc,
        hashKey: true,
        hashValue: true,
    }) {
        let hasher = PoseidonHasherFunc;
        let config = { hashKey: true, hashValue: true };
        if (options.hasher !== undefined) {
            hasher = options.hasher;
        }
        if (options.hashKey !== undefined) {
            config.hashKey = options.hashKey;
        }
        if (options.hashValue !== undefined) {
            config.hashValue = options.hashValue;
        }
        store.clearPrepareOperationCache();
        for (let i = 0; i < SMT_DEPTH; i++) {
            let keyNode = defaultNodes(hasher)[i];
            let value = defaultNodes(hasher)[i + 1];
            let values = [value, value];
            store.preparePutNodes(keyNode, values);
        }
        const root = defaultNodes(hasher)[0];
        store.prepareUpdateRoot(root);
        await store.commit();
        return new SparseMerkleTree(root, store, KeyType, ValueType, hasher, config);
    }
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
    static async import(store, keyType, valueType, options = {
        hasher: PoseidonHasherFunc,
        hashKey: true,
        hashValue: true,
    }) {
        let hasher = PoseidonHasherFunc;
        let config = { hashKey: true, hashValue: true };
        if (options.hasher !== undefined) {
            hasher = options.hasher;
        }
        if (options.hashKey !== undefined) {
            config.hashKey = options.hashKey;
        }
        if (options.hashValue !== undefined) {
            config.hashValue = options.hashValue;
        }
        const root = await store.getRoot();
        return new SparseMerkleTree(root, store, keyType, valueType, hasher, config);
    }
    constructor(root, store, keyType, valueType, hasher, config) {
        this.store = store;
        this.hasher = hasher;
        this.config = config;
        this.root = root;
        this.keyType = keyType;
        this.valueType = valueType;
    }
    getKeyField(key) {
        let keyFields = this.keyType.toFields(key);
        let keyHashOrKeyField = keyFields[0];
        if (this.config.hashKey) {
            keyHashOrKeyField = this.digest(keyFields);
        }
        else {
            if (keyFields.length > 1) {
                throw new Error(`The length of key fields is greater than 1, the key needs to be hashed before it can be processed, option 'hashKey' must be set to true`);
            }
        }
        return keyHashOrKeyField;
    }
    /**
     * Get the root of the tree.
     *
     * @return {*}  {Field}
     * @memberof SparseMerkleTree
     */
    getRoot() {
        return this.root;
    }
    /**
     * Check if the tree is empty.
     *
     * @return {*}  {boolean}
     * @memberof SparseMerkleTree
     */
    isEmpty() {
        const emptyRoot = defaultNodes(this.hasher)[0];
        return this.root.equals(emptyRoot).toBoolean();
    }
    /**
     * Get the depth of the tree.
     *
     * @return {*}  {number}
     * @memberof SparseMerkleTree
     */
    depth() {
        return SMT_DEPTH;
    }
    /**
     * Set the root of the tree.
     *
     * @param {Field} root
     * @memberof SparseMerkleTree
     */
    async setRoot(root) {
        this.store.clearPrepareOperationCache();
        this.store.prepareUpdateRoot(root);
        await this.store.commit();
        this.root = root;
    }
    /**
     * Get the data store of the tree.
     *
     * @return {*}  {Store<V>}
     * @memberof SparseMerkleTree
     */
    getStore() {
        return this.store;
    }
    /**
     * Get the hasher function used by the tree.
     *
     * @return {*}  {Hasher}
     * @memberof SparseMerkleTree
     */
    getHasher() {
        return this.hasher;
    }
    /**
     * Get the value for a key from the tree.
     *
     * @param {K} key
     * @return {*}  {(Promise<V | null>)}
     * @memberof SparseMerkleTree
     */
    async get(key) {
        if (this.isEmpty()) {
            return null;
        }
        let path = this.getKeyField(key);
        try {
            const value = await this.store.getValue(path);
            return value;
        }
        catch (err) {
            console.log(err);
            // if (err.code === 'LEVEL_NOT_FOUND') {
            //   return null;
            // }
            // throw err;
            return null;
        }
    }
    /**
     * Check if the key exists in the tree.
     *
     * @param {K} key
     * @return {*}  {Promise<boolean>}
     * @memberof SparseMerkleTree
     */
    async has(key) {
        const v = await this.get(key);
        if (v === null) {
            return false;
        }
        return true;
    }
    /**
     * Clear the tree.
     *
     * @return {*}  {Promise<void>}
     * @memberof SparseMerkleTree
     */
    async clear() {
        await this.store.clear();
    }
    /**
     * Delete a value from tree and return the new root of the tree.
     *
     * @param {K} key
     * @return {*}  {Promise<Field>}
     * @memberof SparseMerkleTree
     */
    async delete(key) {
        return await this.update(key);
    }
    /**
     * Update a new value for a key in the tree and return the new root of the tree.
     *
     * @param {K} key
     * @param {V} [value]
     * @return {*}  {Promise<Field>}
     * @memberof SparseMerkleTree
     */
    async update(key, value) {
        this.store.clearPrepareOperationCache();
        const newRoot = await this.updateForRoot(this.root, key, value);
        this.store.prepareUpdateRoot(newRoot);
        await this.store.commit();
        this.root = newRoot;
        return this.root;
    }
    /**
     * Update multiple leaves and return the new root of the tree.
     *
     * @param {{ key: K; value?: V }[]} kvs
     * @return {*}  {Promise<Field>}
     * @memberof SparseMerkleTree
     */
    async updateAll(kvs) {
        this.store.clearPrepareOperationCache();
        let newRoot = this.root;
        for (let i = 0, len = kvs.length; i < len; i++) {
            newRoot = await this.updateForRoot(newRoot, kvs[i].key, kvs[i].value);
        }
        this.store.prepareUpdateRoot(newRoot);
        await this.store.commit();
        this.root = newRoot;
        return this.root;
    }
    /**
     * Create a merkle proof for a key against the current root.
     *
     * @param {K} key
     * @return {*}  {Promise<SparseMerkleProof>}
     * @memberof SparseMerkleTree
     */
    async prove(key) {
        return await this.proveForRoot(this.root, key);
    }
    /**
     * Create a compacted merkle proof for a key against the current root.
     *
     * @param {K} key
     * @return {*}  {Promise<SparseCompactMerkleProof>}
     * @memberof SparseMerkleTree
     */
    async proveCompact(key) {
        const proof = await this.prove(key);
        return SMTUtils.compactProof(proof, this.hasher);
    }
    digest(data) {
        return this.hasher(data);
    }
    async updateForRoot(root, key, value) {
        let path = this.getKeyField(key);
        const { sideNodes, pathNodes, leafData } = await this.sideNodesForRoot(root, path);
        const newRoot = this.updateWithSideNodes(sideNodes, pathNodes, leafData, path, value);
        return newRoot;
    }
    updateWithSideNodes(sideNodes, pathNodes, oldLeafData, path, value) {
        let currentHash;
        if (value !== undefined) {
            const valueFields = this.valueType.toFields(value);
            if (this.config.hashValue) {
                currentHash = this.digest(valueFields);
            }
            else {
                if (valueFields.length > 1) {
                    throw new Error(`The length of value fields is greater than 1, the value needs to be hashed before it can be processed, option 'hashValue' must be set to true`);
                }
                currentHash = valueFields[0];
            }
            this.store.preparePutValue(path, value);
        }
        else {
            currentHash = EMPTY_VALUE;
            this.store.prepareDelValue(path);
        }
        if (oldLeafData.equals(currentHash).toBoolean()) {
            return this.root;
        }
        else {
            if (!oldLeafData.equals(EMPTY_VALUE).toBoolean()) {
                for (let i = 0, len = pathNodes.length; i < len; i++) {
                    this.store.prepareDelNodes(pathNodes[i]);
                }
            }
        }
        this.store.preparePutNodes(currentHash, [currentHash]);
        const pathBits = path.toBits();
        for (let i = this.depth() - 1; i >= 0; i--) {
            let sideNode = sideNodes[i];
            let currentValue = [];
            if (pathBits[i].toBoolean() === RIGHT) {
                currentValue = [sideNode, currentHash];
            }
            else {
                currentValue = [currentHash, sideNode];
            }
            currentHash = this.digest(currentValue);
            this.store.preparePutNodes(currentHash, currentValue);
        }
        return currentHash;
    }
    async sideNodesForRoot(root, path) {
        const pathBits = path.toBits();
        let sideNodes = [];
        let pathNodes = [];
        pathNodes.push(root);
        let nodeHash = root;
        let sideNode;
        for (let i = 0, depth = this.depth(); i < depth; i++) {
            const currentValue = await this.store.getNodes(nodeHash);
            if (pathBits[i].toBoolean() === RIGHT) {
                sideNode = currentValue[0];
                nodeHash = currentValue[1];
            }
            else {
                sideNode = currentValue[1];
                nodeHash = currentValue[0];
            }
            sideNodes.push(sideNode);
            pathNodes.push(nodeHash);
        }
        let leafData;
        if (!nodeHash.equals(EMPTY_VALUE).toBoolean()) {
            let leaf = await this.store.getNodes(nodeHash);
            leafData = leaf[0];
        }
        else {
            leafData = EMPTY_VALUE;
        }
        return {
            sideNodes,
            pathNodes: pathNodes.reverse(),
            leafData,
        };
    }
    async proveForRoot(root, key) {
        let path = this.getKeyField(key);
        const { sideNodes } = await this.sideNodesForRoot(root, path);
        return { sideNodes, root };
    }
}
/**
 * Initial empty tree root based on poseidon hash algorithm
 *
 * @static
 * @memberof SparseMerkleTree
 */
SparseMerkleTree.initialPoseidonHashRoot = Field('1363491840476538827947652000140631540976546729195695784589068790317102403216');
