export { MemoryStore };
var SetType;
(function (SetType) {
    SetType[SetType["nodes"] = 0] = "nodes";
    SetType[SetType["values"] = 1] = "values";
})(SetType || (SetType = {}));
var OperationType;
(function (OperationType) {
    OperationType[OperationType["put"] = 0] = "put";
    OperationType[OperationType["del"] = 1] = "del";
})(OperationType || (OperationType = {}));
/**
 * Store based on memory
 *
 * @class MemoryStore
 * @implements {Store<V>}
 * @template V
 */
class MemoryStore {
    /**
     * Creates an instance of MemoryStore.
     * @memberof MemoryStore
     */
    constructor() {
        this.nodesMap = new Map();
        this.valuesMap = new Map();
        this.operationCache = [];
    }
    /**
     * Clear all prepare operation cache.
     *
     * @memberof MemoryStore
     */
    clearPrepareOperationCache() {
        this.operationCache = [];
    }
    /**
     * Get the tree root. Error is thrown when the root does not exist.
     *
     * @return {*}  {Promise<Field>}
     * @memberof MemoryStore
     */
    async getRoot() {
        const fs = this.nodesMap.get('root');
        if (fs && fs.length == 1) {
            return fs[0];
        }
        else {
            throw new Error('Root does not exist');
        }
    }
    /**
     * Prepare update the root. Use the commit() method to actually submit changes.
     *
     * @param {Field} root
     * @memberof MemoryStore
     */
    prepareUpdateRoot(root) {
        this.operationCache.push({
            opType: OperationType.put,
            setType: SetType.nodes,
            k: 'root',
            v: [root],
        });
    }
    /**
     * Get nodes for a key. Error is thrown when a key that does not exist is being accessed.
     *
     * @param {Field} key
     * @return {*}  {Promise<Field[]>}
     * @memberof MemoryStore
     */
    async getNodes(key) {
        let keyStr = key.toString();
        let nodes = this.nodesMap.get(keyStr);
        if (nodes) {
            return nodes;
        }
        else {
            throw new Error('invalid key: ' + keyStr);
        }
    }
    /**
     * Prepare put nodes for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} key
     * @param {Field[]} value
     * @memberof MemoryStore
     */
    preparePutNodes(key, value) {
        this.operationCache.push({
            opType: OperationType.put,
            setType: SetType.nodes,
            k: key.toString(),
            v: value,
        });
    }
    /**
     * Prepare delete nodes for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} key
     * @memberof MemoryStore
     */
    prepareDelNodes(key) {
        this.operationCache.push({
            opType: OperationType.del,
            setType: SetType.nodes,
            k: key.toString(),
            v: undefined,
        });
    }
    /**
     * Get the value for a key. Error is thrown when a key that does not exist is being accessed.
     *
     * @param {Field} path
     * @return {*}  {Promise<V>}
     * @memberof MemoryStore
     */
    async getValue(path) {
        const pathStr = path.toString();
        const v = this.valuesMap.get(pathStr);
        if (v) {
            return v;
        }
        else {
            throw new Error('invalid key: ' + pathStr);
        }
    }
    /**
     * Prepare put the value for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} path
     * @param {V} value
     * @memberof MemoryStore
     */
    preparePutValue(path, value) {
        this.operationCache.push({
            opType: OperationType.put,
            setType: SetType.values,
            k: path.toString(),
            v: value,
        });
    }
    /**
     * Prepare delete the value for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} path
     * @memberof MemoryStore
     */
    prepareDelValue(path) {
        this.operationCache.push({
            opType: OperationType.del,
            setType: SetType.values,
            k: path.toString(),
            v: undefined,
        });
    }
    /**
     * Use the commit() method to actually submit all prepare changes.
     *
     * @return {*}  {Promise<void>}
     * @memberof MemoryStore
     */
    async commit() {
        for (let i = 0, len = this.operationCache.length; i < len; i++) {
            const v = this.operationCache[i];
            if (v.opType === OperationType.put) {
                if (v.setType === SetType.nodes) {
                    this.nodesMap.set(v.k, v.v);
                }
                else {
                    this.valuesMap.set(v.k, v.v);
                }
            }
            else {
                if (v.setType === SetType.nodes) {
                    this.nodesMap.delete(v.k);
                }
                else {
                    this.valuesMap.delete(v.k);
                }
            }
        }
        // console.log(
        //   '[commit] current nodes size: ',
        //   this.nodesMap.size,
        //   ', current values size: ',
        //   this.valuesMap.size
        // );
        this.clearPrepareOperationCache();
    }
    /**
     * Clear the store.
     *
     * @return {*}  {Promise<void>}
     * @memberof MemoryStore
     */
    async clear() {
        this.nodesMap.clear();
        this.valuesMap.clear();
    }
    /**
     * Get values map, key is Field.toString().
     *
     * @return {*}  {Promise<Map<string, V>>}
     * @memberof MemoryStore
     */
    async getValuesMap() {
        return this.valuesMap;
    }
}
