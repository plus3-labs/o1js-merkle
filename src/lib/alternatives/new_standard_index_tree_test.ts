import { newTree } from './new_tree.js';
import { default as levelup } from 'levelup';
import { default as memdown, type MemDown } from 'memdown';
import { PoseidonHasher } from './types/index.js';
import { StandardIndexedTree } from './standard_indexed_tree/standard_indexed_tree.js';
import { Field, Provable } from 'o1js';

// create a leveldb for test
const createMemDown = () => (memdown as any)() as MemDown<any, any>;
let db = new levelup(createMemDown());

// poseidonHasher from o1js package
let poseidonHasher = new PoseidonHasher();

// tree height: 4
const PRIVATE_DATA_TREE_HEIGHT = 4;

// create a standard merkle tree instance
const standardIndexedTreeInstance: StandardIndexedTree = await newTree(
  StandardIndexedTree,
  db,
  poseidonHasher,
  'indexData',
  PRIVATE_DATA_TREE_HEIGHT
);
console.log('standard indexed tree initial root: ', standardIndexedTreeInstance.getRoot(true).toString());

// append the first leaf of type: Field, the newly inserted leaf is kept in an array before being flushed into db.
await standardIndexedTreeInstance.appendLeaves([
  Field(
    '20468198949394563802460512965219839480612000520504690501918527632215047268421'
  ),
]);

// before commit, you must get the leaf by specifying 'leafIndex' and 'includeUncommitted' = true
let leaf1 = await standardIndexedTreeInstance.getLeafValue(0n, true);
console.log('leaf1: ', leaf1?.toString());
// if you mistake specifying 'includeUncommitted' = false, then got 'undefined'. because the newly inserted leaf is not persisted yet.
leaf1 = await standardIndexedTreeInstance.getLeafValue(0n, false);
console.log('leaf1: ', leaf1);

console.log('after append one leaf, tree root based on all cached&persisted leaves: ', standardIndexedTreeInstance.getRoot(true).toString());

let nowRootBeforeCommit = standardIndexedTreeInstance.getRoot(false);
console.log('before commit, tree root based on existing persisted leaves: ', nowRootBeforeCommit.toString());

// persist, i.e. commit the tree into leveldb
await standardIndexedTreeInstance.commit();
console.log('exec commit... now all cached leaves are flushed into db and become parts of persisted leaves');

let nowRootAfterCommit = standardIndexedTreeInstance.getRoot(false);
console.log('after commit, tree root based on all persisted leaves: ', nowRootAfterCommit.toString());

// after commit, now you could successfully get the leaf by specifying 'leafIndex' and 'includeUncommitted' = false
leaf1 = await standardIndexedTreeInstance.getLeafValue(0n, false);
console.log('leaf1: ', leaf1);

// go on append several leaves
await standardIndexedTreeInstance.appendLeaves([Field(11)]);
await standardIndexedTreeInstance.appendLeaves([Field(21)]);
await standardIndexedTreeInstance.appendLeaves([Field(31)]);
await standardIndexedTreeInstance.appendLeaves([Field(41)]);
await standardIndexedTreeInstance.appendLeaves([Field(51)]);
await standardIndexedTreeInstance.appendLeaves([Field(61)]);

// get merkle witness
const witness = await standardIndexedTreeInstance.getSiblingPath(3n, true);
console.log('witness: ', witness.toJSON());
// check the membership within circuit
Provable.runAndCheck(() => {
  const root = witness.calculateRoot(Field(41), Field(3n));
  Provable.log(root);
  Provable.assertEqual(Field, root, nowRootBeforeCommit);
});

const witness2 = await standardIndexedTreeInstance.getSiblingPath(6n, true);
console.log('witness2: ', witness2.toJSON());
Provable.runAndCheck(() => {
  const root = witness2.calculateRoot(Field(0), Field(6n));
  Provable.log('testroot: ', root);
});

await standardIndexedTreeInstance.commit();



