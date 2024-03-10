/// <reference types="node" />
import { Level } from 'level';
import { Hasher } from './types/index.js';
import { TreeBase } from './tree_base.js';
/**
 * Creates a new tree and sets its root, depth and size based on the meta data which are associated with the name.
 * @param c - The class of the tree to be instantiated.
 * @param db - A database used to store the Merkle tree data.
 * @param hasher - A hasher used to compute hash paths.
 * @param name - Name of the tree.
 * @returns The newly created tree.
 */
export declare function loadTree<T extends TreeBase>(c: new (...args: any[]) => T, db: Level<string, Buffer>, hasher: Hasher, name: string): Promise<T>;
