import { IndexedTree, LeafData } from '../interfaces/indexed_tree.js';
import { TreeBase } from '../tree_base.js';
import { Field } from 'o1js';
import { BaseSiblingPath } from '../types/index.js';
/**
 * All of the data to be return during batch insertion.
 */
export interface LowLeafWitnessData {
    /**
     * Preimage of the low nullifier that proves non membership.
     */
    leafData: LeafData;
    /**
     * Sibling path to prove membership of low nullifier.
     */
    siblingPath: BaseSiblingPath;
    /**
     * The index of low nullifier.
     */
    index: bigint;
}
/**
 * Indexed merkle tree.
 */
export declare class StandardIndexedTree extends TreeBase implements IndexedTree {
    leaves: LeafData[];
    private cachedLeaves;
    /**
     * Appends the given leaves to the tree.
     * @param leaves - The leaves to append.
     * @returns Empty promise.
     */
    appendLeaves(leaves: Field[]): Promise<void>;
    /**
     * Commits the changes to the database.
     * @returns Empty promise.
     */
    commit(): Promise<void>;
    /**
     * Rolls back the not-yet-committed changes.
     * @returns Empty promise.
     */
    rollback(): Promise<void>;
    /**
     * !! MUST call 'findIndexOfPreviousValue(*)' to find the 'index' FIRST, and later call this method. By coldStar1993#6265 !!
     * Gets the value of the leaf at the given index.
     * @param index - Index of the leaf of which to obtain the value.
     * @param includeUncommitted - Indicates whether to include uncommitted leaves in the computation.
     * @returns The value of the leaf at the given index or undefined if the leaf is empty.
     */
    getLeafValue(index: bigint, includeUncommitted: boolean): Promise<Field | undefined>;
    /**
     * obtain the current pure leaf value on underlying (Standard) merkle tree. it maybe the default value: Field('0') if 'index' beyond 'getNumLeaves(includeUncommitted)', or else the hash of coorresponding leafData.
     * @param index
     * @param includeUncommitted
     */
    getPureLeafValue(index: bigint, includeUncommitted: boolean): Promise<import("o1js/dist/node/lib/field.js").Field | undefined>;
    /**
     * Finds the index of the largest leaf whose value is less than or equal to the provided value.
     * @param newValue - The new value to be inserted into the tree.
     * @param includeUncommitted - If true, the uncommitted changes are included in the search.
     * @returns The found leaf index and a flag indicating if the corresponding leaf's value is equal to `newValue`.
     */
    findIndexOfPreviousValue(newValue: bigint, includeUncommitted: boolean): {
        /**
         * The index of the found leaf.
         */
        index: number;
        /**
         * A flag indicating if the corresponding leaf's value is equal to `newValue`.
         */
        alreadyPresent: boolean;
    };
    /**
     * !! MUST call 'findIndexOfPreviousValue(*)' to find the 'index' FIRST, and later call this method. By coldStar1993#6265 !!
     * Gets the latest LeafData copy.
     * @param index - Index of the leaf of which to obtain the LeafData copy.
     * @param includeUncommitted - If true, the uncommitted changes are included in the search.
     * @returns A copy of the leaf data at the given index or undefined if the leaf was not found.
     */
    getLatestLeafDataCopy(index: number, includeUncommitted: boolean): LeafData | undefined;
    /**
     * Appends the given leaf to the tree.
     * @param leaf - The leaf to append.
     * @returns Empty promise.
     */
    private appendLeaf;
    /**
     * Finds the index of the minimum value in an array.
     * @param values - The collection of values to be searched.
     * @returns The index of the minimum value in the array.
     */
    private findMinIndex;
    /**
     * Initializes the tree.
     * @param prefilledSize - A number of leaves that are prefilled with values.
     * @returns Empty promise.
     */
    init(prefilledSize: number): Promise<void>;
    /**
     * Loads Merkle tree data from a database and assigns them to this object.
     */
    initFromDb(): Promise<void>;
    /**
     * Commits all the leaves to the database and removes them from a cache.
     */
    private commitLeaves;
    /**
     * Clears the cache.
     */
    private clearCachedLeaves;
    /**
     * Updates a leaf in the tree.
     * @param leaf - New contents of the leaf.
     * @param index - Index of the leaf to be updated.
     */
    private _updateLeaf;
    /**
     * Exposes the underlying tree's update leaf method.
     * @param leaf - The hash to set at the leaf.
     * @param index - The index of the element.
     */
    updateLeafWithNoValueCheck(leaf: LeafData, index: bigint): Promise<void>;
    /**
     * Exposes the underlying tree's update leaf method.
     * @param leaf - The hash to set at the leaf.
     * @param index - The index of the element.
     */
    updateLeaf(leaf: LeafData, index: bigint): Promise<void>;
    /**
     *
     * Each base rollup needs to provide non membership / inclusion proofs for each of the nullifier.
     * This method will return membership proofs and perform partial node updates that will
     * allow the circuit to incrementally update the tree and perform a batch insertion.
     *
     * This offers massive circuit performance savings over doing incremental insertions.
     *
     * A description of the algorithm can be found here: https://colab.research.google.com/drive/1A0gizduSi4FIiIJZ8OylwIpO9-OTqV-R
     *
     * WARNING: This function has side effects, it will insert values into the tree.
     *
     * Assumptions:
     * 1. There are 8 nullifiers provided and they are either unique or empty. (denoted as 0)
     * 2. If kc 0 has 1 nullifier, and kc 1 has 3 nullifiers the layout will assume to be the sparse
     *   nullifier layout: [kc0-0, 0, 0, 0, kc1-0, kc1-1, kc1-2, 0]
     *
     * Algorithm overview
     *
     * In general, if we want to batch insert items, we first to update their low nullifier to point to them,
     * then batch insert all of the values as at once in the final step.
     * To update a low nullifier, we provide an insertion proof that the low nullifier currently exists to the
     * circuit, then update the low nullifier.
     * Updating this low nullifier will in turn change the root of the tree. Therefore future low nullifier insertion proofs
     * must be given against this new root.
     * As a result, each low nullifier membership proof will be provided against an intermediate tree state, each with differing
     * roots.
     *
     * This become tricky when two items that are being batch inserted need to update the same low nullifier, or need to use
     * a value that is part of the same batch insertion as their low nullifier. In this case a zero low nullifier path is given
     * to the circuit, and it must determine from the set of batch inserted values if the insertion is valid.
     *
     * The following example will illustrate attempting to insert 2,3,20,19 into a tree already containing 0,5,10,15
     *
     * The example will explore two cases. In each case the values low nullifier will exist within the batch insertion,
     * One where the low nullifier comes before the item in the set (2,3), and one where it comes after (20,19).
     *
     * The original tree:                       Pending insertion subtree
     *
     *  index     0       2       3       4         -       -       -       -
     *  -------------------------------------      ----------------------------
     *  val       0       5      10      15         -       -       -       -
     *  nextIdx   1       2       3       0         -       -       -       -
     *  nextVal   5      10      15       0         -       -       -       -
     *
     *
     * Inserting 2: (happy path)
     * 1. Find the low nullifier (0) - provide inclusion proof
     * 2. Update its pointers
     * 3. Insert 2 into the pending subtree
     *
     *  index     0       2       3       4         5       -       -       -
     *  -------------------------------------      ----------------------------
     *  val       0       5      10      15         2       -       -       -
     *  nextIdx   5       2       3       0         2       -       -       -
     *  nextVal   2      10      15       0         5       -       -       -
     *
     * Inserting 3: The low nullifier exists within the insertion current subtree
     * 1. When looking for the low nullifier for 3, we will receive 0 again as we have not inserted 2 into the main tree
     *    This is problematic, as we cannot use either 0 or 2 as our inclusion proof.
     *    Why cant we?
     *      - Index 0 has a val 0 and nextVal of 2. This is NOT enough to prove non inclusion of 2.
     *      - Our existing tree is in a state where we cannot prove non inclusion of 3.
     *    We do not provide a non inclusion proof to out circuit, but prompt it to look within the insertion subtree.
     * 2. Update pending insertion subtree
     * 3. Insert 3 into pending subtree
     *
     * (no inclusion proof provided)
     *  index     0       2       3       4         5       6       -       -
     *  -------------------------------------      ----------------------------
     *  val       0       5      10      15         2       3       -       -
     *  nextIdx   5       2       3       0         6       2       -       -
     *  nextVal   2      10      15       0         3       5       -       -
     *
     * Inserting 20: (happy path)
     * 1. Find the low nullifier (15) - provide inculsion proof
     * 2. Update its pointers
     * 3. Insert 20 into the pending subtree
     *
     *  index     0       2       3       4         5       6       7       -
     *  -------------------------------------      ----------------------------
     *  val       0       5      10      15         2       3      20       -
     *  nextIdx   5       2       3       7         6       2       0       -
     *  nextVal   2      10      15      20         3       5       0       -
     *
     * Inserting 19:
     * 1. In this case we can find a low nullifier, but we are updating a low nullifier that has already been updated
     *    We can provide an inclusion proof of this intermediate tree state.
     * 2. Update its pointers
     * 3. Insert 19 into the pending subtree
     *
     *  index     0       2       3       4         5       6       7       8
     *  -------------------------------------      ----------------------------
     *  val       0       5      10      15         2       3      20       19
     *  nextIdx   5       2       3       8         6       2       0       7
     *  nextVal   2      10      15      19         3       5       0       20
     *
     * Perform subtree insertion
     *
     *  index     0       2       3       4       5       6       7       8
     *  ---------------------------------------------------------------------
     *  val       0       5      10      15       2       3      20       19
     *  nextIdx   5       2       3       8       6       2       0       7
     *  nextVal   2      10      15      19       3       5       0       20
     *
     * TODO: this implementation will change once the zero value is changed from h(0,0,0). Changes incoming over the next sprint
     * @param leaves - Values to insert into the tree.
     * @param treeHeight - Height of the tree.
     * @param subtreeHeight - Height of the subtree.
     * @returns The data for the leaves to be updated when inserting the new ones.
     */
    batchInsert(leaves: Field[], treeHeight: number, subtreeHeight: number): Promise<[
        LowLeafWitnessData[],
        BaseSiblingPath
    ] | [undefined, BaseSiblingPath]>;
    getSubtreeSiblingPath(subtreeHeight: number, includeUncommitted: boolean): Promise<BaseSiblingPath>;
}
