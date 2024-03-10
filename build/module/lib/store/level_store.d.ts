/// <reference types="node" />
import { Level } from 'level';
import { Field, Provable } from 'o1js';
import { Store } from './store.js';
import { AbstractBatchPutOperation, AbstractBatchDelOperation, AbstractSublevel } from 'abstract-level';
export { LevelStore };
/**
 * Store based on leveldb
 *
 * @class LevelStore
 * @implements {Store<V>}
 * @template V
 */
declare class LevelStore<V> implements Store<V> {
    protected db: Level<string, any>;
    protected nodesSubLevel: AbstractSublevel<Level<string, any>, string | Buffer | Uint8Array, string, string>;
    protected leavesSubLevel: AbstractSublevel<Level<string, any>, string | Buffer | Uint8Array, string, string>;
    protected operationCache: (AbstractBatchPutOperation<Level<string, any>, string, any> | AbstractBatchDelOperation<Level<string, any>, string>)[];
    protected eltTyp: Provable<V>;
    /**
     * Creates an instance of LevelStore.
     * @param {Level<string, any>} db
     * @param {Provable<V>} eltTyp
     * @param {string} smtName
     * @memberof LevelStore
     */
    constructor(db: Level<string, any>, eltTyp: Provable<V>, smtName: string);
    /**
     * Clear all prepare operation cache.
     *
     * @memberof LevelStore
     */
    clearPrepareOperationCache(): void;
    /**
     * Get the tree root. Error is thrown when the root does not exist.
     *
     * @return {*}  {Promise<Field>}
     * @memberof LevelStore
     */
    getRoot(): Promise<Field>;
    /**
     * Prepare update the root. Use the commit() method to actually submit changes.
     *
     * @param {Field} root
     * @memberof LevelStore
     */
    prepareUpdateRoot(root: Field): void;
    /**
     * Get nodes for a key. Error is thrown when a key that does not exist is being accessed.
     *
     * @param {Field} key
     * @return {*}  {Promise<Field[]>}
     * @memberof LevelStore
     */
    getNodes(key: Field): Promise<Field[]>;
    /**
     * Prepare put nodes for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} key
     * @param {Field[]} value
     * @memberof LevelStore
     */
    preparePutNodes(key: Field, value: Field[]): void;
    /**
     * Prepare delete nodes for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} key
     * @memberof LevelStore
     */
    prepareDelNodes(key: Field): void;
    /**
     * Convert value string to a value of FieldElements type.
     *
     * @protected
     * @param {string} valueStr
     * @param {AsFieldElements<V>} eltTyp
     * @return {*}  {V}
     * @memberof LevelStore
     */
    protected strToValue(valueStr: string, eltTyp: Provable<V>): V;
    /**
     * Get the value for a key. Error is thrown when a key that does not exist is being accessed.
     *
     * @param {Field} path
     * @return {*}  {Promise<V>}
     * @memberof LevelStore
     */
    getValue(path: Field): Promise<V>;
    /**
     * Serialize the value of the FieldElements type into a string
     *
     * @protected
     * @param {V} value
     * @return {*}  {string}
     * @memberof LevelStore
     */
    protected valueToStr(value: V): string;
    /**
     * Prepare put the value for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} path
     * @param {V} value
     * @memberof LevelStore
     */
    preparePutValue(path: Field, value: V): void;
    /**
     * Prepare delete the value for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} path
     * @memberof LevelStore
     */
    prepareDelValue(path: Field): void;
    /**
     * Use the commit() method to actually submit all prepare changes.
     *
     * @return {*}  {Promise<void>}
     * @memberof LevelStore
     */
    commit(): Promise<void>;
    /**
     * Clear the store.
     *
     * @return {*}  {Promise<void>}
     * @memberof LevelStore
     */
    clear(): Promise<void>;
    /**
     * Get values map, key is Field.toString().
     *
     * @return {*}  {Promise<Map<string, V>>}
     * @memberof LevelStore
     */
    getValuesMap(): Promise<Map<string, V>>;
}
