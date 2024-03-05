import { Field } from 'o1js';
import { Schema, model } from 'mongoose';
import { strToFieldArry } from '../utils.js';
export { MongoStore };
const kvSchema = new Schema({
    _id: { type: String, required: true },
    value: { type: String, required: true },
});
/**
 * Store based on MongoDB
 *
 * @class MongoStore
 * @implements {Store<V>}
 * @template V
 */
class MongoStore {
    /**
     * Creates an instance of MongoStore.
     * @param {mongoose.Connection} db
     * @param {Provable<V>} eltTyp
     * @param {string} smtName
     * @memberof MongoStore
     */
    constructor(db, eltTyp, smtName) {
        this.db = db;
        this.nodesModel = model(smtName, kvSchema);
        this.valuesModel = model(smtName + '_leaf', kvSchema);
        this.eltTyp = eltTyp;
        this.nodesOperationCache = [];
        this.valuesOperationCache = [];
    }
    /**
     * Clear all prepare operation cache.
     *
     * @memberof MongoStore
     */
    clearPrepareOperationCache() {
        this.nodesOperationCache = [];
        this.valuesOperationCache = [];
    }
    /**
     * Get the tree root. Error is thrown when the root does not exist.
     *
     * @return {*}  {Promise<Field>}
     * @memberof MongoStore
     */
    async getRoot() {
        const kv = await this.nodesModel.findById('root').exec();
        return Field(kv?.value);
    }
    /**
     * Prepare update the root. Use the commit() method to actually submit changes.
     *
     * @param {Field} root
     * @memberof MongoStore
     */
    prepareUpdateRoot(root) {
        this.nodesOperationCache.push({
            updateOne: {
                filter: { _id: 'root' },
                upsert: true,
                update: { value: root.toString() },
            },
        });
    }
    /**
     * Get nodes for a key. Error is thrown when a key that does not exist is being accessed.
     *
     * @param {Field} key
     * @return {*}  {Promise<Field[]>}
     * @memberof MongoStore
     */
    async getNodes(key) {
        const kv = await this.nodesModel.findById(key.toString()).exec();
        return strToFieldArry(kv?.value);
    }
    /**
     * Prepare put nodes for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} key
     * @param {Field[]} value
     * @memberof MongoStore
     */
    preparePutNodes(key, value) {
        this.nodesOperationCache.push({
            updateOne: {
                filter: { _id: key.toString() },
                upsert: true,
                update: { value: value.toString() },
            },
        });
    }
    /**
     * Prepare delete nodes for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} key
     * @memberof MongoStore
     */
    prepareDelNodes(key) {
        this.nodesOperationCache.push({
            deleteOne: {
                filter: { _id: key.toString() },
            },
        });
    }
    /**
     * Convert value string to a value of FieldElements type.
     *
     * @protected
     * @param {string} valueStr
     * @param {AsFieldElements<V>} eltTyp
     * @return {*}  {V}
     * @memberof MongoStore
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
     * @memberof MongoStore
     */
    async getValue(path) {
        const kv = await this.valuesModel.findById(path.toString()).exec();
        return this.strToValue(kv?.value, this.eltTyp);
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
     * @memberof MongoStore
     */
    preparePutValue(path, value) {
        this.valuesOperationCache.push({
            updateOne: {
                filter: { _id: path.toString() },
                upsert: true,
                update: {
                    value: this.valueToStr(value),
                },
            },
        });
    }
    /**
     * Prepare delete the value for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} path
     * @memberof MongoStore
     */
    prepareDelValue(path) {
        this.valuesOperationCache.push({
            deleteOne: {
                filter: { _id: path.toString() },
            },
        });
    }
    /**
     * Use the commit() method to actually submit all prepare changes.
     *
     * @return {*}  {Promise<void>}
     * @memberof MongoStore
     */
    async commit() {
        await this.db.transaction(async (session) => {
            await this.nodesModel.bulkWrite(this.nodesOperationCache, { session });
            await this.valuesModel.bulkWrite(this.valuesOperationCache, {
                session,
            });
        });
        this.clearPrepareOperationCache();
    }
    /**
     * Clear the store.
     *
     * @return {*}  {Promise<void>}
     * @memberof MongoStore
     */
    async clear() {
        await this.nodesModel.deleteMany({}).exec();
        await this.valuesModel.deleteMany({}).exec();
    }
    /**
     * Get values map, key is Field.toString().
     *
     * @return {*}  {Promise<Map<string, V>>}
     * @memberof MongoStore
     */
    async getValuesMap() {
        const kvs = await this.valuesModel.find({}).exec();
        let valuesMap = new Map();
        kvs.forEach((kv) => {
            valuesMap.set(kv._id, this.strToValue(kv.value, this.eltTyp));
        });
        return valuesMap;
    }
}
