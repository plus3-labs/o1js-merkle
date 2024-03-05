import { Field } from 'o1js';
import { Store } from './store.js';
export { MemoryStore };
declare const enum SetType {
    nodes = 0,
    values = 1
}
declare const enum OperationType {
    put = 0,
    del = 1
}
/**
 * Store based on memory
 *
 * @class MemoryStore
 * @implements {Store<V>}
 * @template V
 */
declare class MemoryStore<V> implements Store<V> {
    protected nodesMap: Map<string, Field[]>;
    protected valuesMap: Map<string, V>;
    protected operationCache: {
        opType: OperationType;
        setType: SetType;
        k: string;
        v: any;
    }[];
    /**
     * Creates an instance of MemoryStore.
     * @memberof MemoryStore
     */
    constructor();
    /**
     * Clear all prepare operation cache.
     *
     * @memberof MemoryStore
     */
    clearPrepareOperationCache(): void;
    /**
     * Get the tree root. Error is thrown when the root does not exist.
     *
     * @return {*}  {Promise<Field>}
     * @memberof MemoryStore
     */
    getRoot(): Promise<Field>;
    /**
     * Prepare update the root. Use the commit() method to actually submit changes.
     *
     * @param {Field} root
     * @memberof MemoryStore
     */
    prepareUpdateRoot(root: Field): void;
    /**
     * Get nodes for a key. Error is thrown when a key that does not exist is being accessed.
     *
     * @param {Field} key
     * @return {*}  {Promise<Field[]>}
     * @memberof MemoryStore
     */
    getNodes(key: Field): Promise<Field[]>;
    /**
     * Prepare put nodes for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} key
     * @param {Field[]} value
     * @memberof MemoryStore
     */
    preparePutNodes(key: Field, value: Field[]): void;
    /**
     * Prepare delete nodes for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} key
     * @memberof MemoryStore
     */
    prepareDelNodes(key: Field): void;
    /**
     * Get the value for a key. Error is thrown when a key that does not exist is being accessed.
     *
     * @param {Field} path
     * @return {*}  {Promise<V>}
     * @memberof MemoryStore
     */
    getValue(path: Field): Promise<V>;
    /**
     * Prepare put the value for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} path
     * @param {V} value
     * @memberof MemoryStore
     */
    preparePutValue(path: Field, value: V): void;
    /**
     * Prepare delete the value for a key. Use the commit() method to actually submit changes.
     *
     * @param {Field} path
     * @memberof MemoryStore
     */
    prepareDelValue(path: Field): void;
    /**
     * Use the commit() method to actually submit all prepare changes.
     *
     * @return {*}  {Promise<void>}
     * @memberof MemoryStore
     */
    commit(): Promise<void>;
    /**
     * Clear the store.
     *
     * @return {*}  {Promise<void>}
     * @memberof MemoryStore
     */
    clear(): Promise<void>;
    /**
     * Get values map, key is Field.toString().
     *
     * @return {*}  {Promise<Map<string, V>>}
     * @memberof MemoryStore
     */
    getValuesMap(): Promise<Map<string, V>>;
}
