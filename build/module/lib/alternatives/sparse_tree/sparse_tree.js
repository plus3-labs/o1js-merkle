import { INITIAL_LEAF, TreeBase } from '../tree_base.js';
/**
 * A Merkle tree implementation that uses a LevelDB database to store the tree.
 */
export class SparseTree extends TreeBase {
    /**
     * Updates a leaf in the tree.
     * @param leaf - New contents of the leaf.
     * @param index - Index of the leaf to be updated.
     */
    async updateLeaf(leaf, index) {
        if (index > this.maxIndex) {
            throw Error(`Index out of bounds. Index ${index}, max index: ${this.maxIndex}.`);
        }
        const insertingZeroElement = leaf.equals(INITIAL_LEAF).toBoolean();
        const originallyZeroElement = (await this.getLeafValue(index, true))
            ?.equals(INITIAL_LEAF)
            .toBoolean();
        if (insertingZeroElement && originallyZeroElement) {
            return;
        }
        await this.addLeafToCacheAndHashToRoot(leaf, index);
        if (insertingZeroElement) {
            // Deleting element (originally non-zero and new value is zero)
            this.cachedSize = (this.cachedSize ?? this.size) - 1n;
        }
        else if (originallyZeroElement) {
            // Inserting new element (originally zero and new value is non-zero)
            this.cachedSize = (this.cachedSize ?? this.size) + 1n;
        }
    }
}
