import { Field } from 'o1js';
import { strToFieldArry } from '../utils.js';
export { LevelStore };
/**
 * Store based on leveldb
 *
 * @class LevelStore
 * @implements {Store<V>}
 * @template V
 */
class LevelStore {
    /**
     * Creates an instance of LevelStore.
     * @param {Level<string, any>} db
     * @param {Provable<V>} eltTyp
     * @param {string} smtName
     * @memberof LevelStore
     */
    constructor(db, eltTyp, smtName) {
        this.db = db;
        this.nodesSubLevel = this.db.sublevel(smtName);
        this.leavesSubLevel = this.db.sublevel(smtName + '_leaf');
        this.operationCache = [];
        this.eltTyp = eltTyp;
    }
    /**
     * Clear all prepare operation cache.
     *
     * @memberof LevelStore
     */
    clearPrepareOperationCache() {
        this.operationCache = [];
    }
    /**
     * Get the tree root. Error is thrown when the root does not exist.
     *
     * @return {*}  {Promise<Field>}
     * @memberof LevelStore
     */
    async getRoot() {
        const valueStr = await this.nodesSubLevel.get('root');
        return Field(valueStr);
    }
    /**
     * Prepare update the root. Use the commit() method to actually submit changes.
     *
     * @param {Field} root
     * @memberof LevelStore
     */
    prepareUpdateRoot(root) {
        this.operationCache.push({
            type: 'put',
            sublevel: this.nodesSubLevel,
            key: 'root',
            value: root.toString(),
        });
    }
    /**
     * Get nodes for a key. Error is thrown when a key that does not exist is being accessed.
     *
     * @param {Field} key
     * @return {*}  {Promise<Field[]>}
     * @memberof LevelStore
     */
    async getNodes(key) {
        const valueStr = await this.nodesSubLevel.get(key.toString());
        return strToFieldArry(valueStr);
    }
    /**
     * Prepare put nodes for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} key
     * @param {Field[]} value
     * @memberof LevelStore
     */
    preparePutNodes(key, value) {
        this.operationCache.push({
            type: 'put',
            sublevel: this.nodesSubLevel,
            key: key.toString(),
            value: value.toString(),
        });
    }
    /**
     * Prepare delete nodes for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} key
     * @memberof LevelStore
     */
    prepareDelNodes(key) {
        this.operationCache.push({
            type: 'del',
            sublevel: this.nodesSubLevel,
            key: key.toString(),
        });
    }
    /**
     * Convert value string to a value of FieldElements type.
     *
     * @protected
     * @param {string} valueStr
     * @param {AsFieldElements<V>} eltTyp
     * @return {*}  {V}
     * @memberof LevelStore
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
     * @memberof LevelStore
     */
    async getValue(path) {
        const valueStr = await this.leavesSubLevel.get(path.toString());
        return this.strToValue(valueStr, this.eltTyp);
    }
    /**
     * Serialize the value of the FieldElements type into a string
     *
     * @protected
     * @param {V} value
     * @return {*}  {string}
     * @memberof LevelStore
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
     * @memberof LevelStore
     */
    preparePutValue(path, value) {
        const valueStr = this.valueToStr(value);
        this.operationCache.push({
            type: 'put',
            sublevel: this.leavesSubLevel,
            key: path.toString(),
            value: valueStr,
        });
    }
    /**
     * Prepare delete the value for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} path
     * @memberof LevelStore
     */
    prepareDelValue(path) {
        this.operationCache.push({
            type: 'del',
            sublevel: this.leavesSubLevel,
            key: path.toString(),
        });
    }
    /**
     * Use the commit() method to actually submit all prepare changes.
     *
     * @return {*}  {Promise<void>}
     * @memberof LevelStore
     */
    async commit() {
        if (this.operationCache.length > 0) {
            await this.db.batch(this.operationCache);
        }
        this.clearPrepareOperationCache();
    }
    /**
     * Clear the store.
     *
     * @return {*}  {Promise<void>}
     * @memberof LevelStore
     */
    async clear() {
        await this.nodesSubLevel.clear();
        await this.leavesSubLevel.clear();
    }
    /**
     * Get values map, key is Field.toString().
     *
     * @return {*}  {Promise<Map<string, V>>}
     * @memberof LevelStore
     */
    async getValuesMap() {
        let valuesMap = new Map();
        for await (const [key, valueStr] of this.leavesSubLevel.iterator()) {
            const value = this.strToValue(valueStr, this.eltTyp);
            valuesMap.set(key, value);
        }
        return valuesMap;
    }
}
