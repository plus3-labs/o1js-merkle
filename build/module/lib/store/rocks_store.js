import { Field } from 'o1js';
import { strToFieldArry } from '../utils.js';
export { RocksStore };
/**
 * Store based on rocksdb
 *
 * @class RocksStore
 * @implements {Store<V>}
 * @template V
 */
class RocksStore {
    /**
     * Creates an instance of RocksStore.
     * @param {levelup.LevelUp} db
     * @param {Provable<V>} eltTyp
     * @param {string} smtName
     * @memberof RocksStore
     */
    constructor(db, eltTyp, smtName) {
        this.db = db;
        this.batch = db.batch();
        this.nodesKey = smtName + ':';
        this.leavesKey = smtName + '_leaf:';
        this.eltTyp = eltTyp;
    }
    /**
     * Clear all prepare operation cache.
     *
     * @memberof RocksStore
     */
    clearPrepareOperationCache() {
        this.batch = this.db.batch();
    }
    /**
     * Get the tree root. Error is thrown when the root does not exist.
     *
     * @return {*}  {Promise<Field>}
     * @memberof RocksStore
     */
    async getRoot() {
        const valueStr = await this.db.get(this.nodesKey + 'root');
        return Field(valueStr);
    }
    /**
     * Prepare update the root. Use the commit() method to actually submit changes.
     *
     * @param {Field} root
     * @memberof RocksStore
     */
    prepareUpdateRoot(root) {
        this.batch = this.batch.put(this.nodesKey + 'root', root.toString());
    }
    /**
     * Get nodes for a key. Error is thrown when a key that does not exist is being accessed.
     *
     * @param {Field} key
     * @return {*}  {Promise<Field[]>}
     * @memberof RocksStore
     */
    async getNodes(key) {
        const valueStr = await this.db.get(this.nodesKey + key.toString());
        return strToFieldArry(valueStr);
    }
    /**
     * Prepare put nodes for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} key
     * @param {Field[]} value
     * @memberof RocksStore
     */
    preparePutNodes(key, value) {
        this.batch = this.batch.put(this.nodesKey + key.toString(), value.toString());
    }
    /**
     * Prepare delete nodes for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} key
     * @memberof RocksStore
     */
    prepareDelNodes(key) {
        this.batch = this.batch.del(this.nodesKey + key.toString());
    }
    /**
     * Convert value string to a value of FieldElements type.
     *
     * @protected
     * @param {string} valueStr
     * @param {AsFieldElements<V>} eltTyp
     * @return {*}  {V}
     * @memberof RocksStore
     */
    strToValue(valueStr, eltTyp) {
        let fs = strToFieldArry(valueStr);
        return eltTyp.fromFields(fs, eltTyp.toAuxiliary());
    }
    /**
     * Get the value for a key. Error is thrown when a key that does not exist is being accessed.
     *
     * @param {Field} path
     * @return {*}  {Promise<V>}
     * @memberof RocksStore
     */
    async getValue(path) {
        const valueStr = await this.db.get(this.leavesKey + path.toString());
        return this.strToValue(valueStr, this.eltTyp);
    }
    /**
     * Serialize the value of the FieldElements type into a string
     *
     * @protected
     * @param {V} value
     * @return {*}  {string}
     * @memberof RocksStore
     */
    valueToStr(value) {
        const valueStr = this.eltTyp.toFields(value).toString();
        return valueStr;
    }
    /**
     * Prepare put the value for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} path
     * @param {V} value
     * @memberof RocksStore
     */
    preparePutValue(path, value) {
        const valueStr = this.valueToStr(value);
        this.batch = this.batch.put(this.leavesKey + path.toString(), valueStr);
    }
    /**
     * Prepare delete the value for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} path
     * @memberof RocksStore
     */
    prepareDelValue(path) {
        this.batch = this.batch.del(this.leavesKey + path.toString());
    }
    /**
     * Use the commit() method to actually submit all prepare changes.
     *
     * @return {*}  {Promise<void>}
     * @memberof RocksStore
     */
    async commit() {
        if (this.batch.length > 0) {
            await this.batch.write();
        }
        this.clearPrepareOperationCache();
    }
    /**
     * Clear the store.
     *
     * @return {*}  {Promise<void>}
     * @memberof RocksStore
     */
    async clear() {
        await this.db.clear();
    }
    /**
     * Get values map, key is Field.toString().
     *
     * @return {*}  {Promise<Map<string, V>>}
     * @memberof RocksStore
     */
    async getValuesMap() {
        let valuesMap = new Map();
        // @ts-ignore
        for await (const [key, valueStr] of this.db.iterator()) {
            const value = this.strToValue(valueStr, this.eltTyp);
            const realKey = key.replace(this.leavesKey, '');
            valuesMap.set(realKey, value);
        }
        return valuesMap;
    }
}
