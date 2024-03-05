import { Provable, Field } from 'o1js';
import { Store } from './store.js';
import levelup from 'levelup';
export { RocksStore };
/**
 * Store based on rocksdb
 *
 * @class RocksStore
 * @implements {Store<V>}
 * @template V
 */
declare class RocksStore<V> implements Store<V> {
    protected db: levelup.LevelUp;
    protected batch: levelup.LevelUpChain;
    protected nodesKey: string;
    protected leavesKey: string;
    protected eltTyp: Provable<V>;
    /**
     * Creates an instance of RocksStore.
     * @param {levelup.LevelUp} db
     * @param {Provable<V>} eltTyp
     * @param {string} smtName
     * @memberof RocksStore
     */
    constructor(db: levelup.LevelUp, eltTyp: Provable<V>, smtName: string);
    /**
     * Clear all prepare operation cache.
     *
     * @memberof RocksStore
     */
    clearPrepareOperationCache(): void;
    /**
     * Get the tree root. Error is thrown when the root does not exist.
     *
     * @return {*}  {Promise<Field>}
     * @memberof RocksStore
     */
    getRoot(): Promise<Field>;
    /**
     * Prepare update the root. Use the commit() method to actually submit changes.
     *
     * @param {Field} root
     * @memberof RocksStore
     */
    prepareUpdateRoot(root: Field): void;
    /**
     * Get nodes for a key. Error is thrown when a key that does not exist is being accessed.
     *
     * @param {Field} key
     * @return {*}  {Promise<Field[]>}
     * @memberof RocksStore
     */
    getNodes(key: Field): Promise<Field[]>;
    /**
     * Prepare put nodes for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} key
     * @param {Field[]} value
     * @memberof RocksStore
     */
    preparePutNodes(key: Field, value: Field[]): void;
    /**
     * Prepare delete nodes for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} key
     * @memberof RocksStore
     */
    prepareDelNodes(key: Field): void;
    /**
     * Convert value string to a value of FieldElements type.
     *
     * @protected
     * @param {string} valueStr
     * @param {AsFieldElements<V>} eltTyp
     * @return {*}  {V}
     * @memberof RocksStore
     */
    protected strToValue(valueStr: string, eltTyp: Provable<V>): V;
    /**
     * Get the value for a key. Error is thrown when a key that does not exist is being accessed.
     *
     * @param {Field} path
     * @return {*}  {Promise<V>}
     * @memberof RocksStore
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
     * @memberof RocksStore
     */
    preparePutValue(path: Field, value: V): void;
    /**
     * Prepare delete the value for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} path
     * @memberof RocksStore
     */
    prepareDelValue(path: Field): void;
    /**
     * Use the commit() method to actually submit all prepare changes.
     *
     * @return {*}  {Promise<void>}
     * @memberof RocksStore
     */
    commit(): Promise<void>;
    /**
     * Clear the store.
     *
     * @return {*}  {Promise<void>}
     * @memberof RocksStore
     */
    clear(): Promise<void>;
    /**
     * Get values map, key is Field.toString().
     *
     * @return {*}  {Promise<Map<string, V>>}
     * @memberof RocksStore
     */
    getValuesMap(): Promise<Map<string, V>>;
}
