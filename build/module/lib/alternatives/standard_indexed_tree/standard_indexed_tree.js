import { toBigIntBE, toBufferBE } from '../../utils.js';
import { TreeBase } from '../tree_base.js';
import { SiblingPath } from '../types/index.js';
import { Field } from 'o1js';
const indexToKeyLeaf = (name, index) => {
    return `${name}:leaf:${index}`;
};
const zeroLeaf = {
    value: 0n,
    nextValue: 0n,
    nextIndex: 0n,
};
/**
 * Pre-compute empty witness.
 * @param treeHeight - Height of tree for sibling path.
 * @returns An empty witness.
 */
function getEmptyLowLeafWitness(treeHeight) {
    class SiblingPath_ extends SiblingPath(treeHeight) {
    }
    return {
        leafData: zeroLeaf,
        index: 0n,
        siblingPath: new SiblingPath_(Array(treeHeight).fill(Field(0))),
    };
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const encodeTreeValue = (leafData) => {
    const valueAsBuffer = toBufferBE(leafData.value, 32);
    const indexAsBuffer = toBufferBE(leafData.nextIndex, 32);
    const nextValueAsBuffer = toBufferBE(leafData.nextValue, 32);
    return Buffer.concat([valueAsBuffer, indexAsBuffer, nextValueAsBuffer]);
};
const hashEncodedTreeValue = (leaf, hasher) => {
    return hasher.compressInputs([leaf.value, leaf.nextValue, leaf.nextIndex].map((val) => Field(val)));
};
const decodeTreeValue = (buf) => {
    const value = toBigIntBE(buf.subarray(0, 32));
    const nextIndex = toBigIntBE(buf.subarray(32, 64));
    const nextValue = toBigIntBE(buf.subarray(64, 96));
    return {
        value,
        nextIndex,
        nextValue,
    };
};
const initialLeaf = {
    value: 0n,
    nextIndex: 0n,
    nextValue: 0n,
};
/**
 * Indexed merkle tree.
 */
export class StandardIndexedTree extends TreeBase {
    constructor() {
        super(...arguments);
        // for debug leaves...
        this.leaves = [];
        this.cachedLeaves = {};
    }
    /**
     * Appends the given leaves to the tree.
     * @param leaves - The leaves to append.
     * @returns Empty promise.
     */
    async appendLeaves(leaves) {
        for (const leaf of leaves) {
            await this.appendLeaf(leaf);
        }
    }
    /**
     * Commits the changes to the database.
     * @returns Empty promise.
     */
    async commit() {
        await super.commit();
        await this.commitLeaves();
    }
    /**
     * Rolls back the not-yet-committed changes.
     * @returns Empty promise.
     */
    async rollback() {
        await super.rollback();
        this.clearCachedLeaves();
    }
    /**
     * !! MUST call 'findIndexOfPreviousValue(*)' to find the 'index' FIRST, and later call this method. By coldStar1993#6265 !!
     * Gets the value of the leaf at the given index.
     * @param index - Index of the leaf of which to obtain the value.
     * @param includeUncommitted - Indicates whether to include uncommitted leaves in the computation.
     * @returns The value of the leaf at the given index or undefined if the leaf is empty.
     */
    getLeafValue(index, includeUncommitted) {
        const leaf = this.getLatestLeafDataCopy(Number(index), includeUncommitted);
        if (!leaf)
            return Promise.resolve(undefined);
        return Promise.resolve(Field(leaf.value));
    }
    /**
     * obtain the current pure leaf value on underlying (Standard) merkle tree. it maybe the default value: Field('0') if 'index' beyond 'getNumLeaves(includeUncommitted)', or else the hash of coorresponding leafData.
     * @param index
     * @param includeUncommitted
     */
    async getPureLeafValue(index, includeUncommitted) {
        const leaf = await super.getLeafValue(index, includeUncommitted);
        return leaf;
    }
    /**
     * Finds the index of the largest leaf whose value is less than or equal to the provided value.
     * @param newValue - The new value to be inserted into the tree.
     * @param includeUncommitted - If true, the uncommitted changes are included in the search.
     * @returns The found leaf index and a flag indicating if the corresponding leaf's value is equal to `newValue`.
     */
    findIndexOfPreviousValue(newValue, includeUncommitted) {
        const numLeaves = this.getNumLeaves(includeUncommitted);
        const diff = [];
        for (let i = 0; i < numLeaves; i++) {
            const storedLeaf = this.getLatestLeafDataCopy(i, includeUncommitted);
            // The stored leaf can be undefined if it addresses an empty leaf
            // If the leaf is empty we do the same as if the leaf was larger
            if (storedLeaf === undefined) {
                diff.push(newValue);
            }
            else if (storedLeaf.value > newValue) {
                diff.push(newValue);
            }
            else if (storedLeaf.value === newValue) {
                return { index: i, alreadyPresent: true };
            }
            else {
                diff.push(newValue - storedLeaf.value);
            }
        }
        const minIndex = this.findMinIndex(diff);
        return { index: minIndex, alreadyPresent: false };
    }
    /**
     * !! MUST call 'findIndexOfPreviousValue(*)' to find the 'index' FIRST, and later call this method. By coldStar1993#6265 !!
     * Gets the latest LeafData copy.
     * @param index - Index of the leaf of which to obtain the LeafData copy.
     * @param includeUncommitted - If true, the uncommitted changes are included in the search.
     * @returns A copy of the leaf data at the given index or undefined if the leaf was not found.
     */
    getLatestLeafDataCopy(index, includeUncommitted) {
        const leaf = !includeUncommitted
            ? this.leaves[index]
            : this.cachedLeaves[index] ?? this.leaves[index];
        return leaf
            ? {
                value: leaf.value,
                nextIndex: leaf.nextIndex,
                nextValue: leaf.nextValue,
            }
            : undefined;
    }
    /**
     * Appends the given leaf to the tree.
     * @param leaf - The leaf to append.
     * @returns Empty promise.
     */
    async appendLeaf(leaf) {
        const newValue = leaf.toBigInt();
        // Special case when appending zero
        if (newValue === 0n) {
            const newSize = (this.cachedSize ?? this.size) + 1n;
            if (newSize - 1n > this.maxIndex) {
                throw Error(`Can't append beyond max index. Max index: ${this.maxIndex}`);
            }
            this.cachedSize = newSize;
            return;
        }
        const indexOfPrevious = this.findIndexOfPreviousValue(newValue, true);
        const previousLeafCopy = this.getLatestLeafDataCopy(indexOfPrevious.index, true);
        if (previousLeafCopy === undefined) {
            throw new Error(`Previous leaf not found!`);
        }
        const newLeaf = {
            value: newValue,
            nextIndex: previousLeafCopy.nextIndex,
            nextValue: previousLeafCopy.nextValue,
        };
        if (indexOfPrevious.alreadyPresent) {
            return;
        }
        // insert a new leaf at the highest index and update the values of our previous leaf copy
        const currentSize = this.getNumLeaves(true);
        previousLeafCopy.nextIndex = BigInt(currentSize);
        previousLeafCopy.nextValue = newLeaf.value;
        this.cachedLeaves[Number(currentSize)] = newLeaf;
        this.cachedLeaves[Number(indexOfPrevious.index)] = previousLeafCopy;
        await this._updateLeaf(hashEncodedTreeValue(previousLeafCopy, this.hasher), BigInt(indexOfPrevious.index));
        await this._updateLeaf(hashEncodedTreeValue(newLeaf, this.hasher), this.getNumLeaves(true));
    }
    /**
     * Finds the index of the minimum value in an array.
     * @param values - The collection of values to be searched.
     * @returns The index of the minimum value in the array.
     */
    findMinIndex(values) {
        if (!values.length) {
            return 0;
        }
        let minIndex = 0;
        for (let i = 1; i < values.length; i++) {
            if (values[minIndex] > values[i]) {
                minIndex = i;
            }
        }
        return minIndex;
    }
    /**
     * Initializes the tree.
     * @param prefilledSize - A number of leaves that are prefilled with values.
     * @returns Empty promise.
     */
    async init(prefilledSize) {
        this.leaves.push(initialLeaf);
        await this._updateLeaf(hashEncodedTreeValue(initialLeaf, this.hasher), 0n);
        this.cachedLeaves[0] = initialLeaf;
        for (let i = 1; i < prefilledSize; i++) {
            await this.appendLeaf(Field(i));
        }
        await this.commit();
    }
    /**
     * Loads Merkle tree data from a database and assigns them to this object.
     */
    async initFromDb() {
        const startingIndex = 0n;
        const values = [];
        const promise = new Promise(async (resolve, reject) => {
            const iterator = this.db
                .iterator({
                gte: indexToKeyLeaf(this.getName(), startingIndex),
                lte: indexToKeyLeaf(this.getName(), 999999999999999999999999999n), //2n ** BigInt(this.getDepth())
            });
            try {
                for await (const [key, value] of iterator) {
                    const arr = key.toString().split(':');
                    const index = Number(arr[arr.length - 1]);
                    values[index] = decodeTreeValue(value);
                }
                resolve();
            }
            catch (err) {
                console.error(err);
                reject();
            }
        });
        await promise;
        this.leaves = values;
    }
    /**
     * Commits all the leaves to the database and removes them from a cache.
     */
    async commitLeaves() {
        const batch = this.db.batch();
        const keys = Object.getOwnPropertyNames(this.cachedLeaves);
        for (const key of keys) {
            const index = Number(key);
            const value = this.cachedLeaves[index].value;
            const nextIndex = this.cachedLeaves[index].nextIndex;
            const nextValue = this.cachedLeaves[index].nextValue;
            batch.put(indexToKeyLeaf(this.getName(), BigInt(index)), encodeTreeValue(this.cachedLeaves[index]));
            this.leaves[index] = this.cachedLeaves[index];
        }
        await batch.write();
        this.clearCachedLeaves();
    }
    /**
     * Clears the cache.
     */
    clearCachedLeaves() {
        this.cachedLeaves = {};
    }
    /**
     * Updates a leaf in the tree.
     * @param leaf - New contents of the leaf.
     * @param index - Index of the leaf to be updated.
     */
    // TODO: rename back to updateLeaf once the old updateLeaf is removed
    async _updateLeaf(leaf, index) {
        if (index > this.maxIndex) {
            throw Error(`Index out of bounds. Index ${index}, max index: ${this.maxIndex}.`);
        }
        await this.addLeafToCacheAndHashToRoot(leaf, index);
        const numLeaves = this.getNumLeaves(true);
        if (index >= numLeaves) {
            this.cachedSize = index + 1n;
        }
    }
    /**
     * Exposes the underlying tree's update leaf method.
     * @param leaf - The hash to set at the leaf.
     * @param index - The index of the element.
     */
    async updateLeafWithNoValueCheck(leaf, index) {
        let encodedLeaf = hashEncodedTreeValue(leaf, this.hasher);
        this.cachedLeaves[Number(index)] = leaf;
        await this._updateLeaf(encodedLeaf, index);
    }
    /**
     * Exposes the underlying tree's update leaf method.
     * @param leaf - The hash to set at the leaf.
     * @param index - The index of the element.
     */
    // TODO: remove once the batch insertion functionality is moved here from circuit_block_builder.ts
    async updateLeaf(leaf, index) {
        let encodedLeaf;
        if (leaf.value == 0n) {
            encodedLeaf = Field(0);
        }
        else {
            encodedLeaf = hashEncodedTreeValue(leaf, this.hasher);
        }
        this.cachedLeaves[Number(index)] = leaf;
        await this._updateLeaf(encodedLeaf, index);
    }
    /* The following doc block messes up with complete-sentence, so we just disable it */
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
    async batchInsert(leaves, treeHeight, subtreeHeight) {
        // Keep track of touched low leaves
        const touched = new Map();
        const emptyLowLeafWitness = getEmptyLowLeafWitness(treeHeight);
        // Accumulators
        const lowLeavesWitnesses = [];
        const pendingInsertionSubtree = [];
        // Start info
        const startInsertionIndex = this.getNumLeaves(true);
        // Get insertion path for each leaf
        for (let i = 0; i < leaves.length; i++) {
            const newValue = leaves[i].toBigInt();
            // Keep space and just insert zero values
            if (newValue === 0n) {
                pendingInsertionSubtree.push(zeroLeaf);
                lowLeavesWitnesses.push(emptyLowLeafWitness);
                continue;
            }
            const indexOfPrevious = this.findIndexOfPreviousValue(newValue, true);
            // If a touched node has a value that is less greater than the current value
            const prevNodes = touched.get(indexOfPrevious.index);
            if (prevNodes && prevNodes.some((v) => v < newValue)) {
                // check the pending low nullifiers for a low nullifier that works
                // This is the case where the next value is less than the pending
                for (let j = 0; j < pendingInsertionSubtree.length; j++) {
                    if (pendingInsertionSubtree[j].value === 0n)
                        continue;
                    if (pendingInsertionSubtree[j].value < newValue &&
                        (pendingInsertionSubtree[j].nextValue > newValue ||
                            pendingInsertionSubtree[j].nextValue === 0n)) {
                        // add the new value to the pending low nullifiers
                        const currentLowLeaf = {
                            value: newValue,
                            nextValue: pendingInsertionSubtree[j].nextValue,
                            nextIndex: pendingInsertionSubtree[j].nextIndex,
                        };
                        pendingInsertionSubtree.push(currentLowLeaf);
                        // Update the pending low leaf to point at the new value
                        pendingInsertionSubtree[j].nextValue = newValue;
                        pendingInsertionSubtree[j].nextIndex =
                            startInsertionIndex + BigInt(i);
                        break;
                    }
                }
                // Any node updated in this space will need to calculate its low nullifier from a previously inserted value
                lowLeavesWitnesses.push(emptyLowLeafWitness);
            }
            else {
                // Update the touched mapping
                if (prevNodes) {
                    prevNodes.push(newValue);
                    touched.set(indexOfPrevious.index, prevNodes);
                }
                else {
                    touched.set(indexOfPrevious.index, [newValue]);
                }
                // get the low leaf
                const lowLeaf = this.getLatestLeafDataCopy(indexOfPrevious.index, true);
                if (lowLeaf === undefined) {
                    return [
                        undefined,
                        await this.getSubtreeSiblingPath(subtreeHeight, true),
                    ];
                }
                const siblingPath = await this.getSiblingPath(BigInt(indexOfPrevious.index), true);
                const witness = {
                    leafData: { ...lowLeaf },
                    index: BigInt(indexOfPrevious.index),
                    siblingPath,
                };
                // Update the running paths
                lowLeavesWitnesses.push(witness);
                const currentLowLeaf = {
                    value: newValue,
                    nextValue: lowLeaf.nextValue,
                    nextIndex: lowLeaf.nextIndex,
                };
                pendingInsertionSubtree.push(currentLowLeaf);
                lowLeaf.nextValue = newValue;
                lowLeaf.nextIndex = startInsertionIndex + BigInt(i);
                await this.updateLeaf(lowLeaf, BigInt(indexOfPrevious.index));
            }
        }
        const newSubtreeSiblingPath = await this.getSubtreeSiblingPath(subtreeHeight, true);
        // Perform batch insertion of new pending values
        for (let i = 0; i < pendingInsertionSubtree.length; i++) {
            await this.updateLeaf(pendingInsertionSubtree[i], startInsertionIndex + BigInt(i));
        }
        return [lowLeavesWitnesses, newSubtreeSiblingPath];
    }
    async getSubtreeSiblingPath(subtreeHeight, includeUncommitted) {
        const nextAvailableLeafIndex = this.getNumLeaves(includeUncommitted);
        const fullSiblingPath = await this.getSiblingPath(nextAvailableLeafIndex, includeUncommitted);
        // Drop the first subtreeHeight items since we only care about the path to the subtree root
        return fullSiblingPath.getSubtreeSiblingPath(subtreeHeight);
    }
}
