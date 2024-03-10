import { Field, Provable } from 'o1js';
import { Store } from './store.js';
import mongoose, { Model } from 'mongoose';
export { MongoStore };
interface IKV {
    _id: string;
    value: string;
}
/**
 * Store based on MongoDB
 *
 * @class MongoStore
 * @implements {Store<V>}
 * @template V
 */
declare class MongoStore<V> implements Store<V> {
    protected db: mongoose.Connection;
    protected nodesModel: Model<IKV, {}, {}, {}, any>;
    protected valuesModel: Model<IKV, {}, {}, {}, any>;
    protected nodesOperationCache: any[];
    protected valuesOperationCache: any[];
    protected eltTyp: Provable<V>;
    /**
     * Creates an instance of MongoStore.
     * @param {mongoose.Connection} db
     * @param {Provable<V>} eltTyp
     * @param {string} smtName
     * @memberof MongoStore
     */
    constructor(db: mongoose.Connection, eltTyp: Provable<V>, smtName: string);
    /**
     * Clear all prepare operation cache.
     *
     * @memberof MongoStore
     */
    clearPrepareOperationCache(): void;
    /**
     * Get the tree root. Error is thrown when the root does not exist.
     *
     * @return {*}  {Promise<Field>}
     * @memberof MongoStore
     */
    getRoot(): Promise<Field>;
    /**
     * Prepare update the root. Use the commit() method to actually submit changes.
     *
     * @param {Field} root
     * @memberof MongoStore
     */
    prepareUpdateRoot(root: Field): void;
    /**
     * Get nodes for a key. Error is thrown when a key that does not exist is being accessed.
     *
     * @param {Field} key
     * @return {*}  {Promise<Field[]>}
     * @memberof MongoStore
     */
    getNodes(key: Field): Promise<Field[]>;
    /**
     * Prepare put nodes for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} key
     * @param {Field[]} value
     * @memberof MongoStore
     */
    preparePutNodes(key: Field, value: Field[]): void;
    /**
     * Prepare delete nodes for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} key
     * @memberof MongoStore
     */
    prepareDelNodes(key: Field): void;
    /**
     * Convert value string to a value of FieldElements type.
     *
     * @protected
     * @param {string} valueStr
     * @param {AsFieldElements<V>} eltTyp
     * @return {*}  {V}
     * @memberof MongoStore
     */
    protected strToValue(valueStr: string, eltTyp: Provable<V>): V;
    /**
     * Get the value for a key. Error is thrown when a key that does not exist is being accessed.
     *
     * @param {Field} path
     * @return {*}  {Promise<V>}
     * @memberof MongoStore
     */
    getValue(path: Field): Promise<V>;
    /**
     * Serialize the value of the FieldElements type into a string
     *
     * @protected
     * @param {V} value
     * @return {*}  {string}
     * @memberof RocksStore
     */
    protected valueToStr(value: V): string;
    /**
     * Prepare put the value for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} path
     * @param {V} value
     * @memberof MongoStore
     */
    preparePutValue(path: Field, value: V): void;
    /**
     * Prepare delete the value for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} path
     * @memberof MongoStore
     */
    prepareDelValue(path: Field): void;
    /**
     * Use the commit() method to actually submit all prepare changes.
     *
     * @return {*}  {Promise<void>}
     * @memberof MongoStore
     */
    commit(): Promise<void>;
    /**
     * Clear the store.
     *
     * @return {*}  {Promise<void>}
     * @memberof MongoStore
     */
    clear(): Promise<void>;
    /**
     * Get values map, key is Field.toString().
     *
     * @return {*}  {Promise<Map<string, V>>}
     * @memberof MongoStore
     */
    getValuesMap(): Promise<Map<string, V>>;
}
