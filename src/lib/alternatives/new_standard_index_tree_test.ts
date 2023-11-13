import { newTree } from './new_tree.js';
import { ChainedBatch, Level } from "level";
import { PoseidonHasher } from './types/index.js';
import { StandardIndexedTree } from './standard_indexed_tree/standard_indexed_tree.js';
import { Field, Poseidon, Provable } from 'o1js';
import { loadTree } from './load_tree.js';
import { LeafData as CircuitLeafData, LeafData, verifyNonMembership } from "./standard_indexed_tree/verify_circuit.js";

// create a leveldb for test
let db = new Level<string, Buffer>('example-index', {valueEncoding:'buffer'});

// poseidonHasher from o1js package
let poseidonHasher = new PoseidonHasher();

// tree height: 4
const PRIVATE_DATA_TREE_HEIGHT = 4;

// indicate if need consider the cached leaves, beside the existing leaves.
const includeUncommitted = true;

// create a standard merkle tree instance
const standardIndexedTreeInstance: StandardIndexedTree = await newTree(
  StandardIndexedTree,
  db,
  poseidonHasher,
  'NULLIFIER_TREE',
  PRIVATE_DATA_TREE_HEIGHT
);
console.log('standard indexed tree initial root: ', standardIndexedTreeInstance.getRoot(includeUncommitted).toString());

// append the first leaf of type: Field, the newly inserted leaf is kept in an array before being flushed into db.
await standardIndexedTreeInstance.appendLeaves([
  Field(
    '20468198949394563802460512965219839480612000520504690501918527632215047268421'
  ),
]);

// before commit, you must get the leaf by specifying 'leafIndex' and 'includeUncommitted' = true
let leaf1 = await standardIndexedTreeInstance.getLeafValue(0n, includeUncommitted);
console.log('leaf1: ', leaf1?.toString());
// if you mistake specifying 'includeUncommitted' = false, then got 'undefined'. because the newly inserted leaf is not persisted yet.
leaf1 = await standardIndexedTreeInstance.getLeafValue(0n, !includeUncommitted);
console.log('leaf1: ', leaf1?.toString());

console.log('after append one leaf, tree root based on all cached&persisted leaves: ', standardIndexedTreeInstance.getRoot(includeUncommitted).toString());

let nowRootBeforeCommit = standardIndexedTreeInstance.getRoot(!includeUncommitted);
console.log('before commit, tree root based on existing persisted leaves: ', nowRootBeforeCommit.toString());

// persist, i.e. commit the tree into leveldb
await standardIndexedTreeInstance.commit();
console.log('exec commit... now all cached leaves are flushed into db and become parts of persisted leaves');

let nowRootAfterCommit = standardIndexedTreeInstance.getRoot(!includeUncommitted);
console.log('after commit, tree root based on all persisted leaves: ', nowRootAfterCommit.toString());

// after commit, now you could successfully get the leaf by specifying 'leafIndex' and 'includeUncommitted' = false
leaf1 = await standardIndexedTreeInstance.getLeafValue(0n, !includeUncommitted);
console.log('leaf1: ', leaf1);

// go on append several leaves
await standardIndexedTreeInstance.appendLeaves([Field(11)]);
await standardIndexedTreeInstance.appendLeaves([Field(21)]);
await standardIndexedTreeInstance.appendLeaves([Field(31)]);
await standardIndexedTreeInstance.appendLeaves([Field(41)]);
await standardIndexedTreeInstance.appendLeaves([Field(51)]);
await standardIndexedTreeInstance.appendLeaves([Field(61)]);

// commit the later newly inserted leaves into levelDB
await standardIndexedTreeInstance.commit();

// Non-Membership merkle witness
nowRootAfterCommit = standardIndexedTreeInstance.getRoot(!includeUncommitted);
const nullifier1 = Field(71n);// the nullifier to be inserted
const { index, alreadyPresent } = await standardIndexedTreeInstance.findIndexOfPreviousValue(nullifier1.toBigInt(), includeUncommitted);
if (alreadyPresent) {// if exist, then throw error.
    throw new Error("nullifier1[${nullifier1}] existed!");
}
const predecessorSiblingPath = (await standardIndexedTreeInstance.getSiblingPath(BigInt(index), includeUncommitted))!;
const leafData = standardIndexedTreeInstance.getLatestLeafDataCopy(index, includeUncommitted)!;
const predecessorLeafData = new LeafData({value: Field(leafData.value), nextIndex: Field(leafData.nextIndex), nextValue: Field(leafData.nextValue)});
const predecessorLeafDataIndex= Field(index);

// the membership witness of previous leaf is the Non-membership witness of 'nullifier1'
Provable.runAndCheck(() => {
  verifyNonMembership(nowRootAfterCommit, nullifier1, predecessorLeafData, predecessorSiblingPath, predecessorLeafDataIndex);
  Provable.log(`verify: true`);
});




