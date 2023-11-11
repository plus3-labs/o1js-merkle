# o1js-merkle

![npm](https://img.shields.io/npm/v/o1js-merkle)
![node-current](https://img.shields.io/node/v/o1js-merkle)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/o1js-merkle)
![npm](https://img.shields.io/npm/dm/o1js-merkle)

**Merkle Trees for o1js (membership / non-membership merkle witness)**

The library contains implementations of *Sparse Merkle Tree*, *Standard Merkle Tree* and *Compact Merkle Tree* based on o1js, which you can use in the **browser** or **node.js** env, and provides a corresponding set of verifiable utility methods that can be run in **circuits**. Besides, you could choose different persistence storage tools for each Merkle tree.

This article gives a brief introduction to SMT: [Whats a sparse merkle tree](https://medium.com/@kelvinfichter/whats-a-sparse-merkle-tree-acda70aeb837)

## Disclaimer and Notes

The library hasn't been audited. The API and the format of the proof may be changed in the future as o1js is updated.
Make sure you know what you are doing before using this library.

## Background
As a succint blockchain, Mina chain only contains 8 fields as onchain states for each zkApp account. Apparently this capacity is not enough, this is why we need maintain offchain storage keeping aligned with the onchain state. The classic solution for offchain storage is using a merkle tree whose root is stored onchain representing the whole offchain data.

As a zkApp engineer, you must learn about the [*merkle tree* ](https://docs.minaprotocol.com/zkapps/o1js/merkle-tree) section at Mina Doc. Well, o1js library provides a memory-based classic MerkleTree implementation and MerkleMap implementation which is for sparse merkle trees.

But please **NOTICE: the both currently are in memory, meaning the data is lost if the process is terminated. So we need to design a persistent storage to keep the data**. And this library provides a set of useful merkle trees implementations with capability of persistence for you!

Within the package, various merkle trees totally belong to 2 catagories:

* **Retrofit from Third-Party Library**

  These implementations are located [here](./src/lib/alternatives/). They are retrofited from [Aztec Merkle Tree library](https://github.com/AztecProtocol/aztec-packages/tree/master/yarn-project/merkle-tree) and currently fully made usage of within [Anomix Network -- a zk-zkRollup layer2 solution on Mina, focusing on Privacy&Scalablility](https://github.com/anomix-zk/anomix-network/).

  Totally there are __three__ kinds of merkle tree implementations:

  * **Append only 'Standard' merkle trees**. New values are inserted into the next available leaf index. Values are never updated.
  * **Indexed trees** are also append only in nature but retain the ability to update leaves. The reason for this is that the Indexed Tree leaves not only store the value but the index of the next highest leaf. New insertions can require prior leaves to be updated.
  * **Sparse trees** that can be updated at any index. The 'size' of the tree is defined by the number of non-empty leaves, not by the highest populated leaf index as is the case with a Standard Tree.

  All of the trees leverage LevelDB as persistence storage. more cases please go to [here](#contents-table-of-retrofit-from-third-party-library).

* **Implementation from the Scratch**

  The other implementations are aside the **Retrofited** ones, which are implemented by us team from scratch. 

  There are also Standard Merkle Tree and Sparse Merkle Tree implementations. What's more flexible, you could choose different persistence tools to store the tree. 
  1. store in **memory**
  2. store in **leveldb**
  3. store in **rocksdb**
  4. store in **mongodb**

  more cases please go to [here](#contents-table-of-implementation-from-the-scratch).

## Table of Contents
- [Install](#install)
  - [Install module](#1-install-module)
- [Contents Table of 'Retrofit from Third-Party library'](#)
  - [Install peer dependencies](#2-install-peer-dependencies)
  - [Usage](#usage)
      - [Create and Load a StandardTree]()
      - [Create and Load a SparseTree]()
      - [Create and Load a StandardIndexedTree]()
- [Contents Table of 'Implementation from the Scratch'](#)
  - [Install peer dependencies](#2-install-peer-dependencies)
  - [What can you do with this library](#what-can-you-do-with-this-library)
  - [Usage](#usage)
    - [Create a merkle tree data store](#create-a-merkle-tree-data-store)
      - [1. Create a memory store](#1-create-a-memory-store)
      - [2. Create a leveldb store](#2-create-a-leveldb-store)
      - [3. Create a rocksdb store](#3-create-a-rocksdb-store)
      - [4. Create a mongodb store](#4-create-a-mongodb-store)
    - [Use MerkleTree (original NumIndexSparseMerkleTree)](#use-merkletree-original-numindexsparsemerkletree)
    - [Use SparseMerkleTree](#use-sparsemerkletree)
    - [Use CompactSparseMerkleTree](#use-compactsparsemerkletree)
  - [3.4 API Reference](#api-reference)


### Install

#### 1. Install module

```bash
npm install o1js-merkle
```

or with yarn:

```bash
yarn add o1js-merkle
```

### Contents Table of 'Retrofit from Third-Party library'

#### Install peer dependencies

```bash
npm install o1js
# yarn add o1js

npm install level
# yarn add level
```

### Usage
#### Create and Load a StandardTree
[here](./src/lib/alternatives/new_standard_tree_test.ts) is the code.

``` ts
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

// indicate if need consider the cached leaves, beside the existing leaves.
const includeUncommitted = true;

// create a standard merkle tree instance
const standardTreeInstance: StandardTree = await newTree(
  StandardTree,
  db,
  poseidonHasher,
  'privateData',
  PRIVATE_DATA_TREE_HEIGHT
);
console.log('standard tree initial root: ', standardTreeInstance.getRoot(includeUncommitted).toString());

// append the first leaf of type: Field, the newly inserted leaf is kept in an array before being flushed into db.
await standardTreeInstance.appendLeaves([
  Field(
    '20468198949394563802460512965219839480612000520504690501918527632215047268421'
  ),
]);

// before commit, you must get the leaf by specifying 'leafIndex' and 'includeUncommitted' = true
let leaf1 = await standardTreeInstance.getLeafValue(0n, includeUncommitted);
console.log('leaf1: ', leaf1?.toString());
// if you mistake specifying 'includeUncommitted' = false, then got 'undefined'. because the newly inserted leaf is not persisted yet.
leaf1 = await standardTreeInstance.getLeafValue(0n, !includeUncommitted);
console.log('leaf1: ', leaf1);

console.log('after append one leaf, tree root based on all cached&persisted leaves: ', standardTreeInstance.getRoot(includeUncommitted).toString());

let nowRootBeforeCommit = standardTreeInstance.getRoot(!includeUncommitted);
console.log('before commit, tree root based on existing persisted leaves: ', nowRootBeforeCommit.toString());

// persist, i.e. commit the tree into leveldb
await standardTreeInstance.commit();
console.log('exec commit... now all cached leaves are flushed into db and become parts of persisted leaves');

let nowRootAfterCommit = standardTreeInstance.getRoot(!includeUncommitted);
console.log('after commit, tree root based on all persisted leaves: ', nowRootAfterCommit.toString());

// after commit, now you could successfully get the leaf by specifying 'leafIndex' and 'includeUncommitted' = false
leaf1 = await standardTreeInstance.getLeafValue(0n, !includeUncommitted);
console.log('leaf1: ', leaf1);

// go on append several leaves
await standardTreeInstance.appendLeaves([Field(11)]);
await standardTreeInstance.appendLeaves([Field(21)]);
await standardTreeInstance.appendLeaves([Field(31)]);
await standardTreeInstance.appendLeaves([Field(41)]);
await standardTreeInstance.appendLeaves([Field(51)]);
await standardTreeInstance.appendLeaves([Field(61)]);

// get merkle witness
const membershipWitness = await standardTreeInstance.getSiblingPath(3n, includeUncommitted);
console.log('witness: ', membershipWitness.toJSON());
// check the membership within circuit
Provable.runAndCheck(() => {
  const root = membershipWitness.calculateRoot(Field(41), Field(3n));
  Provable.log(root);
  Provable.assertEqual(Field, root, nowRootBeforeCommit);
});

const membershipWitness2 = await standardTreeInstance.getSiblingPath(6n, includeUncommitted);
console.log('witness2: ', membershipWitness2.toJSON());
Provable.runAndCheck(() => {
  const root = membershipWitness2.calculateRoot(Field(0), Field(6n));
  Provable.log('testroot: ', root);
});

await standardTreeInstance.commit();


// when you app restart, you could load tree from leveldb easily
const privateDataTree = await loadTree(StandardTree, db, poseidonHasher,  'privateData',)

```


#### Create and Load a SparseTree
similar as StandardTree cases above.


#### Create and Load a StandardIndexedTree
StandardIndexedTree extends StandardTree, but MAINLY used for non-membership merkle witness. So the membership cases are like the ones above, and here are the non-membership witness cases.

[here](./src/lib/alternatives/new_standard_index_tree_test.ts) is the test case code.

``` ts
import { newTree } from './new_tree.js';
import { default as levelup } from 'levelup';
import { default as memdown, type MemDown } from 'memdown';
import { PoseidonHasher } from './types/index.js';
import { StandardIndexedTree } from './standard_indexed_tree/standard_indexed_tree.js';
import { Field, Poseidon, Provable } from 'o1js';

// create a leveldb for test
const createMemDown = () => (memdown as any)() as MemDown<any, any>;
let db = new levelup(createMemDown());

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
const nullifier1 = 71n;// the nullifier to be inserted
const { index, alreadyPresent } = await standardIndexedTreeInstance.findIndexOfPreviousValue(nullifier1, includeUncommitted);
if (alreadyPresent) {// if exist, then throw error.
    throw new Error("nullifier1[${nullifier1}] existed!");
}
const siblingPath = (await standardIndexedTreeInstance.getSiblingPath(BigInt(index), includeUncommitted))!;
const leafData = standardIndexedTreeInstance.getLatestLeafDataCopy(index, includeUncommitted)!;

// compose the result
const nonMembershipWitness = {
  index: `${index}`,
  siblingPath,
  leafData
};

// the membership witness of previous leaf is the Non-membership witness of 'nullifier1'
// pseudocode to check within circuit
console.assert(leafData.nextValue != nullifier1);
const commitment = Poseidon.hash([Field(leafData.value), Field(leafData.nextValue), Field(leafData.nextIndex)]);
const root1 = siblingPath.calculateRoot(commitment, Field(index), poseidonHasher);
// if true, then mean 'nullifier1' is not in the tree.
console.assert(nowRootAfterCommit.equals(root1).toBoolean());


```

If you wanna go deeper the theory of StandardIndexedTree, please refer to [here](https://docs.aztec.network/concepts/advanced/data_structures/indexed_merkle_tree).


### 3. Contents Table of 'Implementation from the Scratch'

#### 3.1 Install peer dependencies

```bash
npm install o1js
# yarn add o1js
```

If you need to use LevelDB to store data, you will also need to install:

```bash
npm install level
# yarn add level
```

RocksDB:

```bash
npm install rocksdb encoding-down levelup
```

MongoDB:

```bash
npm install mongoose
```

### What can you do with this library

You can update the data of Sparse Merkle Tree(SMT) outside the circuit, and then verify the membership proof or non-membership proof of the data in the circuit. At the same time, you can also verify the correctness of the state transformation of SMT in the circuit, which makes us not need to update the SMT in the circuit, but also ensure the legal modification of SMT data outside the circuit. We can verify the validity of data modification through zkApp.

---

### Usage

#### Create a merkle tree data store

##### 1. Create a memory store

```typescript
import { MemoryStore, Store } from 'o1js-merkle';
import { Field } from 'o1js';

// memory data store for Field type data, you can use any CircuitValue from o1js or a custom composite CircuitValue
let store: Store<Field> = new MemoryStore<Field>();
```

##### 2. Create a leveldb store

```typescript
import { Field } from 'o1js';
import { LevelStore, Store } from 'o1js-merkle';
import { Level } from 'level';
// create a leveldb data store for Field type data, you can use any CircuitValue from o1js or a custom composite CircuitValue
const levelDb = new Level<string, any>('./db');
let store: Store<Field> = new LevelStore<Field>(levelDb, Field, 'test');
```

##### 3. Create a rocksdb store

```typescript
import { RocksStore, Store } from 'o1js-merkle';
import { Field } from 'o1js';
import encode from 'encoding-down';
import rocksdb from 'rocksdb';
import levelup from 'levelup';

const encoded = encode(rocksdb('./rocksdb'));
const db = levelup(encoded);
let store: Store<Field> = new RocksStore<Field>(db, Field, 'test');
```

##### 4. Create a mongodb store

```typescript
import mongoose from 'mongoose';
import { MongoStore, Store } from 'o1js-merkle';
import { Field } from 'o1js';

await mongoose.connect('mongodb://localhost/my_database');
let store: Store<Field> = new MongoStore(mongoose.connection, Field, 'test');
```

#### Use MerkleTree (original NumIndexSparseMerkleTree)

> MerkleTree is a merkle tree of numerically indexed data that can customize the tree height, this merkel tree is equivalent to a data structure: Map<bigint, Struct>, Struct can be a CircuitValue type in o1js, such as Field, PublicKey, or a custom composite Struct.
> Tree height <= 254, Numeric index <= (2^height-1).

MerkleTreeUtils: A collection of merkle tree utility methods that do not work in circuits.

ProvableMerkleTreeUtils: A collection of merkle tree utility methods that can be verified to work in circuits

An example of using MerkleTree in the mina smart contract, modified from the example in the [o1js official repo](https://github.com/o1-labs/o1js):
[**merkle_zkapp.ts**](./src/examples/merkle_zkapp.ts)

```typescript
class Account extends Struct({
  address: PublicKey,
  balance: UInt64,
  nonce: UInt32,
}) {}

// Create a memory store
let store = new MemoryStore<Account>();
// initialize a new Merkle Tree with height 8
let tree = await MerkleTree.build(store, 8, Account);

let testValue = new Account({
  address: PrivateKey.random().toPublicKey(),
  balance: UInt64.fromNumber(100),
  nonce: UInt32.fromNumber(0),
});

const root = await tree.update(0n, testValue);

// get value
const v = await tree.get(0n);
// support compact merkle proof
const cproof = await tree.proveCompact(0n);
// decompact NumIndexProof
const proof = MerkleTreeUtils.decompactMerkleProof(cproof);
// check membership outside the circuit
const ok = MerkleTreeUtils.checkMembership(proof, root, 0n, testValue, Account);

// check membership in the circuit
ProvableMerkleTreeUtils.checkMembership(
  proof,
  root,
  Field(0n),
  testValue,
  Account
).assertTrue();

testValue.nonce = testValue.nonce.add(1);
// calculate new root in the circuit
const newRoot = ProvableMerkleTreeUtils.computeRoot(
  proof,
  Field(0n),
  testValue,
  Account
);
```

Support DeepMerkleSubTree: DeepMerkleSubTree is a deep sparse merkle subtree for working on only a few leafs.(ProvableDeepMerkleSubTree is a deep subtree version that works in circuit).
[**DeepMerkleSubTree Example**](./src/experimental/merkle_subtree.ts)

#### Use SparseMerkleTree

> SparseMerkleTree is a merkle tree with a fixed height of 254, this merkel tree is equivalent to a data structure: Map<Struct,Struct>, Struct can be a CircuitValue type in o1js, such as Field, PublicKey, or a custom composite Struct.

SMTUtils: A collection of sparse merkle tree utility methods that do not work in circuits.

ProvableSMTUtils: A collection of sparse merkle tree utility methods that can be verified to work in circuits

An example of using SparseMerkleTree in the mina smart contract, modified from the example in the [o1js official repo](https://github.com/o1-labs/o1js):
[**smt_zkapp.ts**](./src/examples/smt_zkapp.ts)

```typescript
class Account extends Struct({
  address: PublicKey,
  balance: UInt64,
  nonce: UInt32,
}) {}

// Create a memory store
let store = new MemoryStore<Account>();
// Or create a level db store:
// const levelDb = new Level<string, any>('./db');
// let store = new LevelStore<Account>(levelDb, Account, 'test');

let smt = await SparseMerkleTree.build(store, Field, Account);
// Or import a tree by store
// smt = await SparseMerkleTree.importTree<Field, Account>(store);

let testKey = Field(1);
let testValue = new Account({
  address: PrivateKey.random().toPublicKey(),
  balance: UInt64.fromNumber(100),
  nonce: UInt32.fromNumber(0),
});
let newValue = new Account({
  address: PrivateKey.random().toPublicKey(),
  balance: UInt64.fromNumber(50),
  nonce: UInt32.fromNumber(1),
});

const root = await smt.update(testKey, testValue);
// Create a compacted merkle proof for a key against the current root.
const cproof = await smt.proveCompact(testKey);
// Verify the compacted Merkle proof outside the circuit.
const ok = SMTUtils.verifyCompactProof(
  cproof,
  root,
  testKey,
  Field,
  testValue,
  Account
);
console.log('ok: ', ok);

// Create a merkle proof for a key against the current root.
const proof = await smt.prove(testKey);

// Check membership in the circuit, isOk should be true.
let isOk = ProvableSMTUtils.checkMembership(
  proof,
  root,
  testKey,
  Field,
  testValue,
  Account
);

// Check Non-membership in the circuit, isOk should be false.
isOk = ProvableSMTUtils.checkNonMembership(proof, root, testKey, Field);

// Calculate new root in the circuit
let newRoot = ProvableSMTUtils.computeRoot(
  roof.sideNodes,
  testKey,
  Field,
  newValue,
  Account
);
console.log('newRoot: ', newRoot.toString());
```

Support DeepSparseMerkleSubTree: DeepSparseMerkleSubTree is a deep sparse merkle subtree for working on only a few leafs.(ProvableDeepSparseMerkleSubTree is a deep subtree version that works in circuit).
[**DeepSparseMerkleSubTree Example**](./src/experimental/subtree.ts)

#### Use CompactSparseMerkleTree

> CompactSparseMerkleTree is a merkle tree with a fixed height of 254, this merkel tree is equivalent to a data structure: Map<Struct,Struct>, Struct can be a CircuitValue type in o1js, such as Field, PublicKey, or a custom composite Struct. Compared with SparseMerkleTree, its advantage is that it can save storage space, and the operation efficiency of the tree is relatively high, but it is currently impossible to calculate the new root after the state transformation in the circuit.

CSMTUtils: A collection of compact sparse merkle tree utility methods that do not work in circuits.

ProvableCSMTUtils: A collection of compact sparse merkle tree utility methods that can be verified to work in circuits

```typescript
class Account extends Struct({
  address: PublicKey,
  balance: UInt64,
  nonce: UInt32,
}) {}

// Create a memory store
let store = new MemoryStore<Account>();
// Or create a level db store:
// const levelDb = new Level<string, any>('./db');
// let store = new LevelStore<Account>(levelDb, Account, 'test');

let smt = new CompactSparseMerkleTree(store, Field, Account);
// Or import a tree by store
// smt = await CompactSparseMerkleTree.import(store);

let testKey = Field(1);
let testValue = new Account(
  PrivateKey.random().toPublicKey(),
  UInt64.fromNumber(100),
  UInt32.fromNumber(0)
);
let newValue = new Account(
  PrivateKey.random().toPublicKey(),
  UInt64.fromNumber(50),
  UInt32.fromNumber(1)
);

const root = await smt.update(testKey, testValue);

// Create a merkle proof for a key against the current root.
const proof = await smt.prove(testKey);

// Check membership in circuit, isOk should be true.
let isOk = ProvableCSMTUtils.checkMembership(
  proof,
  root,
  testKey,
  Field,
  testValue,
  Account
);

// Check Non-membership in circuit, isOk should be false.
isOk = ProvableCSMTUtils.checkNonMembership(proof, root, testKey, Field);
```

Support CompactDeepSparseMerkleSubTree: CompactDeepSparseMerkleSubTree is a deep sparse merkle subtree for working on only a few leafs.
[**CompactDeepSparseMerkleSubTree Example**](./src/experimental/ctree.ts)

### API Reference

- [API Document](https://github.com/plus3-labs/o1js-merkle)
