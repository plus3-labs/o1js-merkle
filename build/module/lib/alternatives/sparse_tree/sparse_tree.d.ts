import { Field } from 'o1js';
import { UpdateOnlyTree } from '../interfaces/update_only_tree.js';
import { TreeBase } from '../tree_base.js';
/**
 * A Merkle tree implementation that uses a LevelDB database to store the tree.
 */
export declare class SparseTree extends TreeBase implements UpdateOnlyTree {
    /**
     * Updates a leaf in the tree.
     * @param leaf - New contents of the leaf.
     * @param index - Index of the leaf to be updated.
     */
    updateLeaf(leaf: Field, index: bigint): Promise<void>;
}
