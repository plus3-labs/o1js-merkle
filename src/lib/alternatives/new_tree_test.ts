import { newTree } from './new_tree.js';
import { default as levelup } from 'levelup';
import { default as memdown, type MemDown } from 'memdown';
import { PoseidonHasher } from './types/index.js';
import { StandardIndexedTree } from './standard_indexed_tree/standard_indexed_tree.js';
import { IndexedTree } from './interfaces/indexed_tree.js';
import { Field, Provable } from 'o1js';
import { StandardTree } from './standard_tree/standard_tree.js';

const createMemDown = () => (memdown as any)() as MemDown<any, any>;

let db = new levelup(createMemDown());
let poseidonHasher = new PoseidonHasher();
const PRIVATE_DATA_TREE_HEIGHT = 4;
// const tree: IndexedTree = await newTree(
//   StandardIndexedTree,
//   db,
//   poseidonHasher,
//   'privateData',
//   PRIVATE_DATA_TREE_HEIGHT
// );

// tree.appendLeaves([Field(1)]);
// tree.appendLeaves([Field(2)]);
// tree.appendLeaves([Field(3)]);
// tree.appendLeaves([Field(4)]);
// tree.appendLeaves([Field(5)]);
// tree.appendLeaves([Field(6)]);

let a = Buffer.from(Field(1234).toString());
console.log('buf: ', a.toString());

let bs = Field(100).toBits(7);
console.log('bs: ', bs.toString());

const tree: StandardTree = await newTree(
  StandardTree,
  db,
  poseidonHasher,
  'privateData',
  PRIVATE_DATA_TREE_HEIGHT
);

console.log('standard tree init root4: ', tree.getRoot(true).toString());
await tree.appendLeaves([
  Field(
    '20468198949394563802460512965219839480612000520504690501918527632215047268421'
  ),
]);
console.log('root tree init root4: ', tree.getRoot(true).toString());

const tree2: StandardIndexedTree = await newTree(
  StandardIndexedTree,
  db,
  poseidonHasher,
  'indexData',
  4
);

console.log('indexTree init root4: ', tree2.getRoot(true).toString());

await tree.appendLeaves([Field(11)]);
await tree.appendLeaves([Field(21)]);
await tree.appendLeaves([Field(31)]);
await tree.appendLeaves([Field(41)]);
await tree.appendLeaves([Field(51)]);
await tree.appendLeaves([Field(61)]);

// await tree.commit();
const nowRoot = tree.getRoot(true);
console.log('nowRoot: ', nowRoot.toString());

const witness = await tree.getSiblingPath(3n, true);
console.log('witness: ', witness.toJSON());

Provable.runAndCheck(() => {
  const root = witness.calculateRoot(Field(41), Field(3n));
  Provable.log(root);
  Provable.assertEqual(Field, root, nowRoot);
});

const witness2 = await tree.getSiblingPath(6n, true);
console.log('witness2: ', witness2.toJSON());

Provable.runAndCheck(() => {
  const root = witness2.calculateRoot(Field(0), Field(6n));
  Provable.log('testroot: ', root);
});

// await tree.appendLeaves([Field(41)]);
const newRoot = tree.getRoot(true);
console.log('newRoot: ', newRoot.toString());
