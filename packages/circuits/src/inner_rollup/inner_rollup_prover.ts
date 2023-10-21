import { FEE_ASSET_ID_SUPPORT_NUM } from '../constants';
import {
  Bool,
  Empty,
  Experimental,
  Field,
  Provable,
  SelfProof,
  Struct,
} from 'o1js';
import {
  DataRootWitnessData,
  InnerRollupInput,
  InnerRollupOutput,
  TxFee,
} from './models';
import { JoinSplitProof } from '../join_split/join_split_prover';
import { ActionType, AssetId, DUMMY_FIELD } from '../models/constants';
import { checkMembership, greaterThanFor254BitField } from '../utils/utils';
import {
  DataMerkleWitness,
  LeafData,
  LowLeafWitnessData,
  NullifierMerkleWitness,
} from '../models/merkle_witness';

export { InnerRollupProver, InnerRollupProof };

class TempStruct extends Struct({
  checkDataRootValid: Bool,
  txValid: Bool,
  currDataRoot: Field,
  currDataIndex: Field,
  currNullRoot: Field,
  currNullIndex: Field,
}) {}

class TempStruct2 extends Struct({
  checkWitnessValid: Bool,
  currRoot: Field,
  currIndex: Field,
}) {}

let InnerRollupProver = Experimental.ZkProgram({
  publicOutput: InnerRollupOutput,

  methods: {
    proveTxBatch: {
      privateInputs: [InnerRollupInput, JoinSplitProof, JoinSplitProof],
      method(
        input: InnerRollupInput,
        txProof1: JoinSplitProof,
        txProof2: JoinSplitProof
      ) {
        Provable.log('innerRollupInput: ', input);
        const dataStartIndex = input.dataStartIndex;
        const nullStartIndex = input.nullStartIndex;
        const oldDataRoot = input.oldDataRoot;
        const oldNullRoot = input.oldNullRoot;
        const depositRoot = input.depositRoot;
        const tx1OldDataWitness1 = input.tx1OldDataWitness1;
        const tx1OldDataWitness2 = input.tx1OldDataWitness2;
        const tx2OldDataWitness1 = input.tx2OldDataWitness1;
        const tx2OldDataWitness2 = input.tx2OldDataWitness2;
        const dataRootsRoot = input.dataRootsRoot;
        const tx1RootWitnessData = input.tx1RootWitnessData;
        const tx2RootWitnessData = input.tx2RootWitnessData;
        const tx1LowLeafWitness1 = input.tx1LowLeafWitness1;
        const tx1LowLeafWitness2 = input.tx1LowLeafWitness2;
        const tx2LowLeafWitness1 = input.tx2LowLeafWitness1;
        const tx2LowLeafWitness2 = input.tx2LowLeafWitness2;
        const tx1OldNullWitness1 = input.tx1OldNullWitness1;
        const tx1OldNullWitness2 = input.tx1OldNullWitness2;
        const tx2OldNullWitness1 = input.tx2OldNullWitness1;
        const tx2OldNullWitness2 = input.tx2OldNullWitness2;
        const totalTxFees: TxFee[] = Array(FEE_ASSET_ID_SUPPORT_NUM).fill(
          TxFee.zero()
        );
        totalTxFees[0].assetId = AssetId.MINA;

        const txOutput1 = txProof1.publicOutput;
        const tx1IsDeposit = txOutput1.actionType.equals(ActionType.DEPOSIT);
        Provable.log('tx1IsDeposit: ', tx1IsDeposit);
        const txOutput2 = txProof2.publicOutput;
        const tx2IsDeposit = txOutput2.actionType.equals(ActionType.DEPOSIT);
        Provable.log('tx2IsDeposit: ', tx2IsDeposit);

        let currentDataRoot = oldDataRoot;
        let currentDataIndex = dataStartIndex;
        let currentNullRoot = oldNullRoot;
        let currentNullIndex = nullStartIndex;
        let currentDepositStartIndex = input.oldDepositStartIndex;
        let currentDepositCount = Field(0);

        Provable.log('depositRoot: ', depositRoot);
        depositRoot.assertNotEquals(DUMMY_FIELD, 'Deposit root is illegal');
        //let firstDepositIndex = currentDepositStartIndex;

        Provable.log('txOutput1 depositIndex: ', txOutput1.depositIndex);
        Provable.log('txOutput2 depositIndex: ', txOutput2.depositIndex);
        // Provable.if(
        //   tx1IsDeposit.and(tx2IsDeposit),
        //   Bool,
        //   txOutput2.depositIndex.equals(txOutput1.depositIndex.add(1)),
        //   Bool(true)
        // ).assertTrue('Deposit index should be consecutive');

        // find first deposit index if exists deposit tx
        // firstDepositIndex = Provable.if(
        //   tx1IsDeposit,
        //   Field,
        //   txOutput1.depositIndex,
        //   firstDepositIndex
        // );
        // firstDepositIndex = Provable.if(
        //   tx1IsDeposit.not().and(tx2IsDeposit),
        //   Field,
        //   txOutput2.depositIndex,
        //   firstDepositIndex
        // );

        // Provable.log('firstDepositIndex: ', firstDepositIndex);
        // Provable.log('currentDepositStartIndex: ', currentDepositStartIndex);
        // firstDepositIndex.assertEquals(
        //   currentDepositStartIndex,
        //   'First deposit index should be equal to current deposit start index'
        // );

        let currentRollupSize = Field(0);
        // process tx1
        Provable.log('Process tx1');
        let {
          currentDataRoot: currentDataRoot1,
          currentDataIndex: currentDataIndex1,
          currentNullRoot: currentNullRoot1,
          currentNullIndex: currentNullIndex1,
          currentDepositStartIndex: currentDepositStartIndex1,
          currentRollupSize: currentRollupSize1,
          txFee: txFee1,
          currentDepositCount: currentDepositCount1,
        } = processTx({
          txProof: txProof1,
          depositRoot,
          currentDepositStartIndex,
          txFee: totalTxFees[0],
          rootWitnessData: tx1RootWitnessData,
          dataRootsRoot,
          currentDataRoot,
          currentDataIndex,
          oldDataWitness1: tx1OldDataWitness1,
          oldDataWitness2: tx1OldDataWitness2,
          lowLeafWitness1: tx1LowLeafWitness1,
          lowLeafWitness2: tx1LowLeafWitness2,
          currentNullRoot,
          currentNullIndex,
          oldNullWitness1: tx1OldNullWitness1,
          oldNullWitness2: tx1OldNullWitness2,
          currentRollupSize,
          currentDepositCount,
        });

        // process tx2
        Provable.log('Process tx2');
        let {
          currentDataRoot: currentDataRoot2,
          // currentDataIndex: currentDataIndex2,
          currentNullRoot: currentNullRoot2,
          // currentNullIndex: currentNullIndex2,
          currentDepositStartIndex: currentDepositStartIndex2,
          currentRollupSize: currentRollupSize2,
          txFee: txFee2,
          currentDepositCount: currentDepositCount2,
        } = processTx({
          txProof: txProof2,
          depositRoot,
          currentDepositStartIndex: currentDepositStartIndex1,
          txFee: txFee1,
          rootWitnessData: tx2RootWitnessData,
          dataRootsRoot,
          currentDataRoot: currentDataRoot1,
          currentDataIndex: currentDataIndex1,
          oldDataWitness1: tx2OldDataWitness1,
          oldDataWitness2: tx2OldDataWitness2,
          lowLeafWitness1: tx2LowLeafWitness1,
          lowLeafWitness2: tx2LowLeafWitness2,
          currentNullRoot: currentNullRoot1,
          currentNullIndex: currentNullIndex1,
          oldNullWitness1: tx2OldNullWitness1,
          oldNullWitness2: tx2OldNullWitness2,
          currentRollupSize: currentRollupSize1,
          currentDepositCount: currentDepositCount1,
        });

        totalTxFees[0] = txFee2;

        let output = new InnerRollupOutput({
          rollupId: DUMMY_FIELD,
          rollupSize: currentRollupSize2,
          oldDataRoot: oldDataRoot,
          newDataRoot: currentDataRoot2,
          oldNullRoot: oldNullRoot,
          newNullRoot: currentNullRoot2,
          dataRootsRoot: dataRootsRoot,
          totalTxFees: totalTxFees,
          depositRoot: depositRoot,
          depositCount: currentDepositCount2,
          oldDepositStartIndex: input.oldDepositStartIndex,
          newDepositStartIndex: currentDepositStartIndex2,
        });

        const rollupId = output.generateRollupId();
        output.rollupId = rollupId;
        return output;
      },
    },

    merge: {
      privateInputs: [SelfProof, SelfProof],
      method(
        p1: SelfProof<Empty, InnerRollupOutput>,
        p2: SelfProof<Empty, InnerRollupOutput>
      ) {
        p1.verify();
        p2.verify();

        const p1Output = p1.publicOutput;
        const p2Output = p2.publicOutput;

        p1Output.newDataRoot.assertEquals(
          p2Output.oldDataRoot,
          'p1 new data root unequal p2 old data root'
        );
        p1Output.newNullRoot.assertEquals(
          p2Output.oldNullRoot,
          'p1 new null root unequal p2 old null root'
        );
        p1Output.newDepositStartIndex.assertEquals(
          p2Output.oldDepositStartIndex,
          'p1 new deposit start index unequal p2 old deposit start index'
        );
        p1Output.dataRootsRoot.assertEquals(
          p2Output.dataRootsRoot,
          'p1 dataRootsRoot unequal p2 dataRootsRoot'
        );
        p1Output.depositRoot.assertEquals(
          p2Output.depositRoot,
          'p1 depositRoot unequal p2 depositRoot'
        );

        let totalTxFees = p1Output.totalTxFees;
        totalTxFees[0].fee = totalTxFees[0].fee.add(
          p2Output.totalTxFees[0].fee
        );

        let newRollupSize = p1Output.rollupSize.add(p2Output.rollupSize);

        let newOutput = new InnerRollupOutput({
          rollupId: DUMMY_FIELD,
          rollupSize: newRollupSize,
          oldDataRoot: p1Output.oldDataRoot,
          newDataRoot: p2Output.newDataRoot,
          oldNullRoot: p1Output.oldNullRoot,
          newNullRoot: p2Output.newNullRoot,
          dataRootsRoot: p1Output.dataRootsRoot,
          totalTxFees: totalTxFees,
          depositRoot: p1Output.depositRoot,
          depositCount: p1Output.depositCount.add(p2Output.depositCount),
          oldDepositStartIndex: p1Output.oldDepositStartIndex,
          newDepositStartIndex: p2Output.newDepositStartIndex,
        });
        const rollupId = newOutput.generateRollupId();
        newOutput.rollupId = rollupId;
        return newOutput;
      },
    },
  },
});

class InnerRollupProof extends Experimental.ZkProgram.Proof(
  InnerRollupProver
) {}

function processTx({
  txProof,
  depositRoot,
  currentDepositStartIndex,
  txFee,
  rootWitnessData,
  dataRootsRoot,
  currentDataRoot,
  currentDataIndex,
  oldDataWitness1,
  oldDataWitness2,
  lowLeafWitness1,
  lowLeafWitness2,
  currentNullRoot,
  currentNullIndex,
  oldNullWitness1,
  oldNullWitness2,
  currentRollupSize,
  currentDepositCount,
}: {
  txProof: JoinSplitProof;
  depositRoot: Field;
  currentDepositStartIndex: Field;
  txFee: TxFee;
  rootWitnessData: DataRootWitnessData;
  dataRootsRoot: Field;
  currentDataRoot: Field;
  currentDataIndex: Field;
  oldDataWitness1: DataMerkleWitness;
  oldDataWitness2: DataMerkleWitness;
  lowLeafWitness1: LowLeafWitnessData;
  lowLeafWitness2: LowLeafWitnessData;
  currentNullRoot: Field;
  currentNullIndex: Field;
  oldNullWitness1: NullifierMerkleWitness;
  oldNullWitness2: NullifierMerkleWitness;
  currentRollupSize: Field;
  currentDepositCount: Field;
}): {
  currentDataRoot: Field;
  currentDataIndex: Field;
  currentNullRoot: Field;
  currentNullIndex: Field;
  currentDepositStartIndex: Field;
  currentRollupSize: Field;
  txFee: TxFee;
  currentDepositCount: Field;
} {
  txProof.verify();
  const txOutput = txProof.publicOutput;
  const outputNoteCommitment1 = txOutput.outputNoteCommitment1;
  const outputNoteCommitment2 = txOutput.outputNoteCommitment2;
  const nullifier1 = txOutput.nullifier1;
  const nullifier2 = txOutput.nullifier2;
  const txIsDeposit = txOutput.actionType.equals(ActionType.DEPOSIT);
  const txIsDummy = txOutput.actionType.equals(ActionType.DUMMY);
  const originDataRoot = currentDataRoot;
  const originDataIndex = currentDataIndex;
  const originNullRoot = currentNullRoot;
  const originNullIndex = currentNullIndex;

  Provable.log('txIsDummy: ', txIsDummy);
  currentRollupSize = Provable.if(
    txIsDummy,
    currentRollupSize,
    currentRollupSize.add(1)
  );

  Provable.if(
    txIsDeposit,
    Bool,
    txOutput.depositRoot.equals(depositRoot),
    Bool(true)
  ).assertTrue(
    'Tx deposit root should be equal to deposit root of private input'
  );
  txFee.fee = txFee.fee.add(txOutput.txFee);

  const [depositStartIndex, depositCount] = Provable.if(
    txIsDeposit,
    Provable.Array(Field, 2),
    [currentDepositStartIndex.add(1), currentDepositCount.add(1)],
    [currentDepositStartIndex, currentDepositCount]
  );
  Provable.log('depositStartIndex: ', depositStartIndex);
  Provable.log('depositCount: ', depositCount);

  // check tx data root validity
  // const checkDataRootValid = checkMembership(
  //   txOutput.dataRoot,
  //   rootWitnessData.dataRootIndex,
  //   rootWitnessData.witness,
  //   dataRootsRoot
  // );
  const checkDataRootValid = Bool(true);
  Provable.log('checkDataRootValid: ', checkDataRootValid);

  // process outputNoteCommitment1
  // const checkWitnessOfCommitment1Valid = checkMembership(
  //   DUMMY_FIELD,
  //   currentDataIndex,
  //   oldDataWitness1,
  //   currentDataRoot
  // );
  const checkWitnessOfCommitment1Valid = Bool(true);
  Provable.log(
    'checkWitnessOfCommitment1Valid: ',
    checkWitnessOfCommitment1Valid
  );
  currentDataRoot = oldDataWitness1.calculateRoot(
    outputNoteCommitment1,
    currentDataIndex
  );
  Provable.log('currentDataRoot: ', currentDataRoot);
  currentDataIndex = currentDataIndex.add(1);
  Provable.log('currentDataIndex: ', currentDataIndex);
  //------------------------------------------------------------------------------

  // processs outputNoteCommitment2
  const {
    checkWitnessValid: checkWitnessOfCommitment2Valid,
    currRoot,
    currIndex,
  } = Provable.if(
    outputNoteCommitment2.equals(DUMMY_FIELD),
    TempStruct2,
    new TempStruct2({
      checkWitnessValid: Bool(true),
      currRoot: currentDataRoot,
      currIndex: currentDataIndex,
    }),
    new TempStruct2({
      // check index and witness of outputNoteCommitment2
      // checkWitnessValid: checkMembership(
      //   DUMMY_FIELD,
      //   currentDataIndex,
      //   oldDataWitness2,
      //   currentDataRoot
      // ),
      checkWitnessValid: Bool(true),
      // use index, witness and new note commitment to update data root
      currRoot: oldDataWitness2.calculateRoot(
        outputNoteCommitment2,
        currentDataIndex
      ),
      currIndex: currentDataIndex.add(1),
    })
  );
  currentDataRoot = currRoot;
  currentDataIndex = currIndex;
  Provable.log(
    'checkWitnessOfCommitment2Valid: ',
    checkWitnessOfCommitment2Valid
  );
  Provable.log('currentDataRoot: ', currentDataRoot);
  Provable.log('currentDataIndex: ', currentDataIndex);
  //------------------------------------------------------------------------------

  // process nullifier1
  // nullifier1 can not be empty when tx is not deposit
  const null1IsDummy = nullifier1.equals(DUMMY_FIELD);
  Provable.log('null1IsDummy: ', null1IsDummy);
  const checkNullifier1Valid = Provable.if(
    txIsDeposit,
    Bool,
    null1IsDummy,
    null1IsDummy.not()
  );
  Provable.log('checkNullifier1Valid: ', checkNullifier1Valid);

  // const checkLowLeafMembership =
  //   lowLeafWitness1.checkMembership(currentNullRoot);
  const checkLowLeafMembership = Bool(true);
  Provable.log('checkLowLeafMembership: ', checkLowLeafMembership);

  const checkNullifier1GreaterThanLowLeafValue = greaterThanFor254BitField(
    nullifier1,
    lowLeafWitness1.leafData.value
  );

  Provable.log(
    'checkNullifier1GreaterThanLowLeafValue: ',
    checkNullifier1GreaterThanLowLeafValue
  );

  const lowLeafNextValue1 = lowLeafWitness1.leafData.nextValue;
  Provable.log('lowLeafNextValue1: ', lowLeafNextValue1);

  const checkNullifier1LessThanLowLeafNextValue = Provable.if(
    lowLeafNextValue1.equals(DUMMY_FIELD),
    Bool,
    Bool(true),
    greaterThanFor254BitField(lowLeafNextValue1, nullifier1)
  );
  Provable.log(
    'checkNullifier1LeassThanLowLeafNextValue: ',
    checkNullifier1LessThanLowLeafNextValue
  );

  const nullifier1LeafData = new LeafData({
    value: nullifier1,
    nextValue: lowLeafWitness1.leafData.nextValue,
    nextIndex: lowLeafWitness1.leafData.nextIndex,
  });
  // update lowLeafData in nullifier tree
  const newLowLeafData1 = new LeafData({
    value: lowLeafWitness1.leafData.value,
    nextValue: nullifier1LeafData.value,
    nextIndex: currentNullIndex,
  });

  const afterUpdateLowLeafNullRoot = lowLeafWitness1.siblingPath.calculateRoot(
    newLowLeafData1.commitment(),
    lowLeafWitness1.index
  );
  Provable.log(
    'after update lowLeafData1, afterUpdateLowLeafNullRoot: ',
    afterUpdateLowLeafNullRoot
  );

  // const checkWitnessOfNullifier1Valid = checkMembership(
  //   DUMMY_FIELD,
  //   currentNullIndex,
  //   oldNullWitness1,
  //   afterUpdateLowLeafNullRoot
  // );
  const checkWitnessOfNullifier1Valid = Bool(true);
  Provable.log(
    'checkWitnessOfNullifier1Valid: ',
    checkWitnessOfNullifier1Valid
  );

  const {
    checkWitnessValid: nullifier1Valid,
    currRoot: currRoot2,
    currIndex: currIndex2,
  } = Provable.if(
    null1IsDummy,
    TempStruct2,
    new TempStruct2({
      checkWitnessValid: Bool(true),
      currRoot: currentNullRoot,
      currIndex: currentNullIndex,
    }),
    new TempStruct2({
      checkWitnessValid: checkNullifier1Valid
        .and(checkLowLeafMembership)
        .and(checkNullifier1GreaterThanLowLeafValue)
        .and(checkNullifier1LessThanLowLeafNextValue)
        .and(checkWitnessOfNullifier1Valid),
      currRoot: oldNullWitness1.calculateRoot(
        nullifier1LeafData.commitment(),
        currentNullIndex
      ),
      currIndex: currentNullIndex.add(1),
    })
  );
  currentNullRoot = currRoot2;
  currentNullIndex = currIndex2;
  Provable.log('nullifier1Valid: ', nullifier1Valid);
  Provable.log('currentNullRoot: ', currentNullRoot);
  Provable.log('currentNullIndex: ', currentNullIndex);
  //-----------------------------------------------------------------------------

  // process nullifier2
  const null2IsDummy = nullifier2.equals(DUMMY_FIELD);
  Provable.log('null2IsDummy: ', null2IsDummy);

  const checkNullifier2Valid = Provable.if(
    txIsDeposit,
    Bool,
    null2IsDummy,
    Bool(true)
  );
  Provable.log('checkNullifier2Valid: ', checkNullifier2Valid);

  // const checkLowLeafMembership2 =
  //   lowLeafWitness2.checkMembership(currentNullRoot);
  const checkLowLeafMembership2 = Bool(true);
  Provable.log('checkLowLeafMembership2: ', checkLowLeafMembership2);

  const checkNullifier2GreaterThanLowLeafValue = greaterThanFor254BitField(
    nullifier2,
    lowLeafWitness2.leafData.value
  );

  Provable.log(
    'checkNullifier2GreaterThanLowLeafValue: ',
    checkNullifier2GreaterThanLowLeafValue
  );

  const lowLeafNextValue2 = lowLeafWitness2.leafData.nextValue;
  Provable.log('lowLeafNextValue2: ', lowLeafNextValue2);

  const checkNullifier2LessThanLowLeafNextValue = Provable.if(
    lowLeafNextValue2.equals(DUMMY_FIELD),
    Bool,
    Bool(true),
    greaterThanFor254BitField(lowLeafNextValue2, nullifier2)
  );
  Provable.log(
    'checkNullifier2LeassThanLowLeafNextValue: ',
    checkNullifier2LessThanLowLeafNextValue
  );

  const nullifier2LeafData = new LeafData({
    value: nullifier2,
    nextValue: lowLeafWitness2.leafData.nextValue,
    nextIndex: lowLeafWitness2.leafData.nextIndex,
  });
  // update lowLeafData in nullifier tree
  const newLowLeafData2 = new LeafData({
    value: lowLeafWitness2.leafData.value,
    nextValue: nullifier2LeafData.value,
    nextIndex: currentNullIndex,
  });
  const afterUpdateLowLeafNullRoot2 = lowLeafWitness2.siblingPath.calculateRoot(
    newLowLeafData2.commitment(),
    lowLeafWitness2.index
  );
  Provable.log(
    'after update lowLeafData2, afterUpdateLowLeafNullRoot2: ',
    afterUpdateLowLeafNullRoot2
  );

  // const checkWitnessOfNullifier2Valid = checkMembership(
  //   DUMMY_FIELD,
  //   currentNullIndex,
  //   oldNullWitness2,
  //   afterUpdateLowLeafNullRoot2
  // );
  const checkWitnessOfNullifier2Valid = Bool(true);
  Provable.log(
    'checkWitnessOfNullifier2Valid: ',
    checkWitnessOfNullifier2Valid
  );

  const {
    checkWitnessValid: nullifier2Valid,
    currRoot: currRoot3,
    currIndex: currIndex3,
  } = Provable.if(
    null2IsDummy,
    TempStruct2,
    new TempStruct2({
      checkWitnessValid: Bool(true),
      currRoot: currentNullRoot,
      currIndex: currentNullIndex,
    }),
    new TempStruct2({
      checkWitnessValid: checkNullifier2Valid
        .and(checkLowLeafMembership2)
        .and(checkNullifier2GreaterThanLowLeafValue)
        .and(checkNullifier2LessThanLowLeafNextValue)
        .and(checkWitnessOfNullifier2Valid),
      currRoot: oldNullWitness2.calculateRoot(
        nullifier2LeafData.commitment(),
        currentNullIndex
      ),
      currIndex: currentNullIndex.add(1),
    })
  );
  currentNullRoot = currRoot3;
  currentNullIndex = currIndex3;
  Provable.log('nullifier2Valid: ', nullifier2Valid);
  Provable.log('currentNullRoot: ', currentNullRoot);
  Provable.log('currentNullIndex: ', currentNullIndex);
  //-----------------------------------------------------------------------------

  // process dummy and non-dummy
  const {
    checkDataRootValid: rootValid,
    txValid,
    currDataRoot,
    currDataIndex,
    currNullRoot,
    currNullIndex,
  } = Provable.if(
    txIsDummy,
    TempStruct,
    new TempStruct({
      checkDataRootValid: Bool(true),
      txValid: Bool(true),
      currDataRoot: originDataRoot,
      currDataIndex: originDataIndex,
      currNullRoot: originNullRoot,
      currNullIndex: originNullIndex,
    }),

    new TempStruct({
      checkDataRootValid,
      txValid: checkWitnessOfCommitment1Valid
        .and(checkWitnessOfCommitment2Valid)
        .and(nullifier1Valid)
        .and(nullifier2Valid),
      currDataRoot: currentDataRoot,
      currDataIndex: currentDataIndex,
      currNullRoot: currentNullRoot,
      currNullIndex: currentNullIndex,
    })
  );

  rootValid.assertTrue('data roots root is not valid');
  txValid.assertTrue('tx is not valid');
  currentDataRoot = currDataRoot;
  currentDataIndex = currDataIndex;
  currentNullRoot = currNullRoot;
  currentNullIndex = currNullIndex;

  return {
    currentDataRoot,
    currentDataIndex,
    currentNullRoot,
    currentNullIndex,
    currentDepositStartIndex: depositStartIndex,
    currentRollupSize,
    txFee,
    currentDepositCount: depositCount,
  };
}
