import { newTree } from './new_tree.js';
import { default as levelup } from 'levelup';
import { default as memdown, type MemDown } from 'memdown';
import { PoseidonHasher } from './types/index.js';
import { StandardIndexedTree } from './standard_indexed_tree/standard_indexed_tree.js';
import { Field, Provable } from 'o1js';
import { StandardTree } from './standard_tree/standard_tree.js';

// create a leveldb for test
const createMemDown = () => (memdown as any)() as MemDown<any, any>;
let db = new levelup(createMemDown());

// poseidonHasher from o1js package
let poseidonHasher = new PoseidonHasher();

// tree height: 4
const PRIVATE_DATA_TREE_HEIGHT = 4;

// create a standard merkle tree instance
const standardTreeInstance: StandardTree = await newTree(
  StandardTree,
  db,
  poseidonHasher,
  'privateData',
  PRIVATE_DATA_TREE_HEIGHT
);
console.log('standard tree initial root: ', standardTreeInstance.getRoot(true).toString());

// append the first leaf of type: Field, the newly inserted leaf is kept in an array before being flushed into db.
await standardTreeInstance.appendLeaves([
  Field(
    '20468198949394563802460512965219839480612000520504690501918527632215047268421'
  ),
]);

// before commit, you must get the leaf by specifying 'leafIndex' and 'includeUncommitted' = true
let leaf1 = await standardTreeInstance.getLeafValue(0n, true);
console.log('leaf1: ', leaf1?.toString());
// if you mistake specifying 'includeUncommitted' = false, then got 'undefined'. because the newly inserted leaf is not persisted yet.
leaf1 = await standardTreeInstance.getLeafValue(0n, false);
console.log('leaf1: ', leaf1);

console.log('after append one leaf, tree root based on all cached&persisted leaves: ', standardTreeInstance.getRoot(true).toString());

let nowRootBeforeCommit = standardTreeInstance.getRoot(false);
console.log('before commit, tree root based on existing persisted leaves: ', nowRootBeforeCommit.toString());

// persist, i.e. commit the tree into leveldb
await standardTreeInstance.commit();
console.log('exec commit... now all cached leaves are flushed into db and become parts of persisted leaves');

let nowRootAfterCommit = standardTreeInstance.getRoot(false);
console.log('after commit, tree root based on all persisted leaves: ', nowRootAfterCommit.toString());

// after commit, now you could successfully get the leaf by specifying 'leafIndex' and 'includeUncommitted' = false
leaf1 = await standardTreeInstance.getLeafValue(0n, false);
console.log('leaf1: ', leaf1);

// go on append several leaves
await standardTreeInstance.appendLeaves([Field(11)]);
await standardTreeInstance.appendLeaves([Field(21)]);
await standardTreeInstance.appendLeaves([Field(31)]);
await standardTreeInstance.appendLeaves([Field(41)]);
await standardTreeInstance.appendLeaves([Field(51)]);
await standardTreeInstance.appendLeaves([Field(61)]);

// get merkle witness
const witness = await standardTreeInstance.getSiblingPath(3n, true);
console.log('witness: ', witness.toJSON());
// check the membership within circuit
Provable.runAndCheck(() => {
  const root = witness.calculateRoot(Field(41), Field(3n));
  Provable.log(root);
  Provable.assertEqual(Field, root, nowRootBeforeCommit);
});

const witness2 = await standardTreeInstance.getSiblingPath(6n, true);
console.log('witness2: ', witness2.toJSON());
Provable.runAndCheck(() => {
  const root = witness2.calculateRoot(Field(0), Field(6n));
  Provable.log('testroot: ', root);
});

await standardTreeInstance.commit();




const tree2: StandardIndexedTree = await newTree(
  StandardIndexedTree,
  db,
  poseidonHasher,
  'indexData',
  4
);

console.log('indexTree init root4: ', tree2.getRoot(true).toString());
