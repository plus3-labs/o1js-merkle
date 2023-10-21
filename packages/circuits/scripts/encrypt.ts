/* eslint-disable @typescript-eslint/ban-ts-comment */
// import { valueToNode } from '@babel/types';
// import {
//   Empty,
//   Experimental,
//   Field,
//   FlexibleProvablePure,
//   Proof,
//   Provable,
//   provablePure,
//   Struct,
// } from 'o1js';

import {
  Bool,
  Encryption,
  Field,
  Group,
  Poseidon,
  PrivateKey,
  PublicKey,
} from 'o1js';
import { ValueNote } from '../src/models/value_note';

// let MyProgram = Experimental.ZkProgram({
//   publicOutput: Field,

//   methods: {
//     baseCase: {
//       privateInputs: [Field],
//       method(f: Field) {
//         return f.add(1);
//       },
//     },
//   },
// });

// class TestProof extends Proof<Empty, Field> {
//   static publicInputType = Empty;
//   static publicOutputType = Field;
//   static tag = () => MyProgram;
// }
// let TestProof = Experimental.ZkProgram.Proof(MyProgram);
// const ProofArr = provablePure(
//   Array(5).fill(Experimental.ZkProgram.Proof(MyProgram))
// );

// class ProofArr extends Struct({
//   value: TestProof,
//   value1: TestProof,
// }) {}

// let MyProgram2 = Experimental.ZkProgram({
//   publicOutput: Field,

//   methods: {
//     baseCase: {
//       // @ts-ignore
//       privateInputs: [ProofArr, Field],
//       method(ps: ProofArr, f: Field) {
//         //@ts-ignore
//         ps.value.verify();
//         //@ts-ignore
//         ps.value1.verify();
//         const a = Provable.if(f.equals(0), Field, Field(1), Field(2));
//         return a.add(1);
//       },
//     },
//   },
// });

// let result = MyProgram2.compile();
// console.log('result: ', result);

let privateKey1 = PrivateKey.random();
let publicKey1 = privateKey1.toPublicKey();

let privateKey2 = PrivateKey.random();
let publicKey2 = privateKey2.toPublicKey();

// 1 to 2
// let secret1 = publicKey2.toGroup().scale(privateKey1.s);
// let a = Poseidon.hash(secret1.toFields());
// console.log('a: ', a.toString());

// let secret2 = publicKey1.toGroup().scale(privateKey2.s);
// let b = Poseidon.hash(secret2.toFields());
// console.log('b: ', b.toString());

// let commitment = Poseidon.hash([Field.random(), Field.random()]);
// let temp = privateKey1.toBigInt();
// let newTem = temp + commitment.toBigInt();
// let newPrivateKey1 = PrivateKey.fromBigInt(newTem);
// let newPublicKey1 = newPrivateKey1.toPublicKey();
// console.log('newPublicKey1: ', newPublicKey1.toBase58());

// let temp2 = privateKey2.toBigInt();
// let newTem2 = temp2 + commitment.toBigInt();
// let newPrivateKey2 = PrivateKey.fromBigInt(newTem2);
// let newPublicKey2 = newPrivateKey2.toPublicKey();
// console.log('newPublicKey2: ', newPublicKey2.toBase58());

let secret1 = publicKey2.toGroup().scale(privateKey1.s);
let share = secret1.toFields();
console.log('share: ', share.toString());

let encryptedShare = Encryption.encrypt(share, publicKey1);
let arr: { publicKey: Group; cipherText: Field[] }[] = [];
for (let i = 0; i < 1000; i++) {
  arr.push({
    publicKey: encryptedShare.publicKey,
    cipherText: encryptedShare.cipherText.slice(),
  });
}

// 正常都可以解密
console.time('mina decrypt');
for (let i = 0; i < 1000; i++) {
  try {
    let decryptedShare = Encryption.decrypt(arr[i], privateKey1);
  } catch (e) {
    console.log('e: ', e);
  }
}
console.timeEnd('mina decrypt');

console.time('mina decrypt2');
for (let i = 0; i < 1000; i++) {
  let decryptedShare = publicKey2.toGroup().scale(privateKey1.s).toFields();
}
console.timeEnd('mina decrypt2');

console.log('ps: ', publicKey1.toFields().toString());

const rand = Field.random();
const pub2Fs = publicKey2.toFields();
let se = Poseidon.hash(privateKey1.toFields()).toBigInt() | rand.toBigInt();
const pubFields = [Field(pub2Fs[0].toBigInt() ^ se), pub2Fs[1]];

// console.log('publicKey2: ', pub2Fs.toString());

// let n = getEncKey(pubFields, privateKey1, rand);
// console.log('decrypt publicKey2: ', n.toFields().toString());

console.time('mina decrypt3');
const priKeyHash = privateKey1.toPublicKey().toFields()[0].toBigInt();
for (let i = 0; i < 1000; i++) {
  let nPriK = genNewPrivateKey(privateKey1, rand);
  let nPubK = getEncKey(pubFields, priKeyHash, rand);
  let shares = nPubK.toGroup().scale(nPriK.s).toFields();
}
console.timeEnd('mina decrypt3');

console.time('mina decrypt4');
for (let i = 0; i < 1000; i++) {
  const priKeyHash = Poseidon.hash(privateKey1.toFields()).toBigInt();
}
console.timeEnd('mina decrypt4');

console.time('mina decrypt5');
for (let i = 0; i < 1000; i++) {
  const priKeyHash = privateKey1.toPublicKey().toFields()[0];
}
console.timeEnd('mina decrypt5');

function genNewPrivateKey(priKey: PrivateKey, rand: Field): PrivateKey {
  let temp = priKey.toBigInt();
  let newTem = temp & rand.toBigInt();
  return PrivateKey.fromBigInt(newTem);
}

function getEncKey(oriFs: Field[], priKeyHash: bigint, rand: Field): PublicKey {
  let se = priKeyHash | rand.toBigInt();
  let oriF0BigInt = oriFs[0].toBigInt();

  let ori = oriF0BigInt ^ se;
  let newPk = PublicKey.fromFields([Field(ori), oriFs[1]]);
  return newPk;
}
