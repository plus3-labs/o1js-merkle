import { Field } from 'o1js';
import { AppendOnlyTree } from '../interfaces/append_only_tree.js';
import { TreeBase } from '../tree_base.js';
/**
 * A Merkle tree implementation that uses a LevelDB database to store the tree.
 */
export declare class StandardTree extends TreeBase implements AppendOnlyTree {
    /**
     * Appends the given leaves to the tree.
     * @param leaves - The leaves to append.
     * @returns Empty promise.
     */
    appendLeaves(leaves: Field[]): Promise<void>;
}
