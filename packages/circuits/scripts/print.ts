import {
    BlockProver,
    DepositRollupProver,
    AnomixEntryContract,
    InnerRollupProver,
    JoinSplitProver,
    AnomixRollupContract,
} from '../src';

import fs from "fs";

let joinSplitProverVk = await JoinSplitProver.compile();
console.log('JoinSplitVK=', joinSplitProverVk.verificationKey);
fs.writeFileSync('./circuit-JoinSplitProverVK.string', joinSplitProverVk.verificationKey);

const proof = await JoinSplitProver.dummy();
const dummyTxStr = JSON.stringify(proof.toJSON());

fs.writeFileSync('./circuit-JoinsplitProofDummyTx.string', dummyTxStr);

console.log(dummyTxStr);

/*
let joinSplitProverVk = await JoinSplitProver.compile();
console.log('JoinSplitVK=', joinSplitProverVk.verificationKey);

const joinSplitProof = await JoinSplitProver.dummy();
console.log('joinSplitProof0: ', joinSplitProof);
console.log('joinSplitProof1: ', JSON.stringify(joinSplitProof));

let depositRollupProverVk = await DepositRollupProver.compile();
console.log('DepositRollupProverVK=', depositRollupProverVk.verificationKey);

// let anomixEntryContractVk = await AnomixEntryContract.compile();
// console.log(anomixEntryContractVk.verificationKey);


// let withdrawAccountVk = await WithdrawAccount.compile();
// console.log(withdrawAccountVk.verificationKey);

// let anomixRollupContractVk = await AnomixRollupContract.compile();
// console.log(anomixRollupContractVk.verificationKey);


let innerRollupProverVk = await InnerRollupProver.compile();
console.log('InnerRollupProverVK=', innerRollupProverVk.verificationKey);


let block_proverVk = await BlockProver.compile();
console.log('BlockProverVK=', block_proverVk.verificationKey);


*/
