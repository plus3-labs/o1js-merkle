import {
  SmartContract,
  PublicKey,
  Field,
  method,
  Mina,
  PrivateKey,
  AccountUpdate,
  Reducer,
} from 'o1js';

export class Demo extends SmartContract {
  reducer = Reducer({ actionType: Field });

  @method test(x: Field) {
    this.reducer.dispatch(x);
  }
}

let Blockchain = Mina.Network({
  mina: 'https://proxy.testworld.minaexplorer.com',
  archive: 'https://archive.testworld.minaexplorer.com',
});
Mina.setActiveInstance(Blockchain);

const feePayerKey = PrivateKey.fromBase58(
  'EKEYsgTRYCFKZbwx1kTBs6Qkiu8qmeN9JHK17iDJsNBtxdzpKF5w'
);
const feePayerAddress = PublicKey.fromBase58(
  'B62qrJnVDdyzQcTv2fay7fgYBF9zRaMi6ukrJ3QCjpxDTHboxNQgyVz'
);

const zkappKey = PrivateKey.fromBase58(
  'EKEmcpB3kU4MqR7KzrLzbVUzHMduQafHXGwRos94QpSYX8pdVmtA'
);
const zkappAddress = PublicKey.fromBase58(
  'B62qnd9Ub6kFjAwemb6534AeHMoVLMENgArGNAZ1bTH3DsJQwYfW2Po'
);

const zkapp = new Demo(zkappAddress);

console.log('Compiling smart contract...');
console.time('compile');
let { verificationKey } = await Demo.compile();
console.timeEnd('compile');

// console.log('Deploying smart contract...');
// let tx = await Mina.transaction(
//   { sender: feePayerAddress, fee: 1.01 * 10e8, memo: 'test actions' },
//   () => {
//     AccountUpdate.fundNewAccount(feePayerAddress);
//     zkapp.deploy({ verificationKey });
//   }
// );
// await tx.prove();

// console.log('start send deploy tx...');
// let txId = await tx.sign([feePayerKey, zkappKey]).send();
// console.log('txId: ', txId.hash());
// try {
//   await txId.wait({ maxAttempts: 100000 });
// } catch (err) {
//   console.error(err);
//   setTimeout(
//     async () => await txId.wait({ maxAttempts: 100000 }),
//     1 * 60 * 1000
//   );
// }
// console.log('deploy success');

// //===============tx1================
// tx = await Mina.transaction(
//   { sender: feePayerAddress, fee: 1.01 * 10e8, memo: 'action 1' },
//   () => {
//     zkapp.test(Field(1));
//     zkapp.test(Field(2));
//     zkapp.test(Field(3));
//   }
// );
// await tx.prove();
// console.log('start send tx 1...');
// txId = await tx.sign([feePayerKey]).send();
// console.log('txId1: ', txId.hash());
// try {
//   await txId.wait({ maxAttempts: 100000 });
// } catch (err) {
//   console.error(err);
//   setTimeout(
//     async () => await txId.wait({ maxAttempts: 100000 }),
//     1 * 60 * 1000
//   );
// }
// console.log('tx 1 success');

//===============tx2================
let tx = await Mina.transaction(
  { sender: feePayerAddress, fee: 1.01 * 10e8, memo: 'action 2' },
  () => {
    zkapp.test(Field(7));
  }
);
await tx.prove();
console.log('start send tx 2...');
let txId = await tx.sign([feePayerKey]).send();
console.log('txId2: ', txId.hash());
try {
  await txId.wait({ maxAttempts: 100000 });
} catch (err) {
  console.error(err);
  setTimeout(
    async () => await txId.wait({ maxAttempts: 100000 }),
    1 * 60 * 1000
  );
}
console.log('tx 2 success');

// //===============tx2================
// tx = await Mina.transaction(
//   { sender: feePayerAddress, fee: 1.01 * 10e8, memo: 'action 2' },
//   () => {
//     zkapp.test(Field(2));
//   }
// );
// await tx.prove();
// console.log('start send tx 2...');
// txId = await tx.sign([feePayerKey]).send();
// console.log('txId2: ', txId.hash());
// try {
//   await txId.wait({ maxAttempts: 100000 });
// } catch (err) {
//   console.error(err);
//   setTimeout(
//     async () => await txId.wait({ maxAttempts: 100000 }),
//     1 * 60 * 1000
//   );
// }
// console.log('tx 2 success');

// //===============tx3================
// tx = await Mina.transaction(
//   { sender: feePayerAddress, fee: 1.01 * 10e8, memo: 'action 2' },
//   () => {
//     zkapp.test(Field(2));
//   }
// );
// await tx.prove();
// console.log('start send tx 2...');
// txId = await tx.sign([feePayerKey]).send();
// console.log('txId2: ', txId.hash());
// try {
//   await txId.wait({ maxAttempts: 100000 });
// } catch (err) {
//   console.error(err);
//   setTimeout(
//     async () => await txId.wait({ maxAttempts: 100000 }),
//     1 * 60 * 1000
//   );
// }
// console.log('tx 2 success');
