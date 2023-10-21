import { InnerRollupProof } from '../inner_rollup/inner_rollup_prover';
import { Experimental, Provable } from 'o1js';
import { BlockProveInput, BlockProveOutput } from './models';
import { checkMembershipAndAssert } from '../utils/utils';
import { DUMMY_FIELD } from '../models/constants';
import { RollupState, RollupStateTransition } from '../rollup_contract/models';

export { BlockProver, RollupProof };

let BlockProver = Experimental.ZkProgram({
  publicOutput: BlockProveOutput,

  methods: {
    prove: {
      privateInputs: [BlockProveInput, InnerRollupProof],
      method(input: BlockProveInput, rollupProof: InnerRollupProof) {
        rollupProof.verify();

        Provable.log('input: ', input);
        const rollupOutput = rollupProof.publicOutput;
        const txFeeReceiverNote = input.txFeeReceiverNote;

        Provable.log('txFeeReceiverNote', txFeeReceiverNote);
        txFeeReceiverNote.ownerPk
          .isEmpty()
          .assertFalse('txFeeReceiver should not be empty');
        rollupOutput.totalTxFees[0].fee.assertEquals(txFeeReceiverNote.value);
        rollupOutput.totalTxFees[0].assetId.assertEquals(
          txFeeReceiverNote.assetId,
          'assetId should match'
        );

        // update data tree
        const oldDataRoot = rollupOutput.newDataRoot;
        // check index and witness of old data root
        // checkMembershipAndAssert(
        //   DUMMY_FIELD,
        //   input.dataStartIndex,
        //   input.oldDataWitness,
        //   oldDataRoot,
        //   'dataStartIndex and oldDataWitness should be valid'
        // );
        const newDataRoot = input.oldDataWitness.calculateRoot(
          txFeeReceiverNote.commitment(),
          input.dataStartIndex
        );
        Provable.log('newDataRoot', newDataRoot);

        // update root root tree
        // check index and witness of old data roots root
        // checkMembershipAndAssert(
        //   DUMMY_FIELD,
        //   input.rootStartIndex,
        //   input.oldRootWitness,
        //   rollupOutput.dataRootsRoot,
        //   'rootStartIndex and oldRootWitness should be valid'
        // );

        // use index and witness to update data roots root
        const newDataRootsRoot = input.oldRootWitness.calculateRoot(
          newDataRoot,
          input.rootStartIndex
        );
        Provable.log('newDataRootsRoot', newDataRootsRoot);

        let output = new BlockProveOutput({
          blockHash: DUMMY_FIELD,
          rollupSize: rollupOutput.rollupSize,
          stateTransition: new RollupStateTransition({
            source: new RollupState({
              dataRoot: rollupOutput.oldDataRoot,
              nullifierRoot: rollupOutput.oldNullRoot,
              dataRootsRoot: rollupOutput.dataRootsRoot,
              depositStartIndex: rollupOutput.oldDepositStartIndex,
            }),
            target: new RollupState({
              dataRoot: newDataRoot,
              nullifierRoot: rollupOutput.newNullRoot,
              dataRootsRoot: newDataRootsRoot,
              depositStartIndex: rollupOutput.newDepositStartIndex,
            }),
          }),
          depositRoot: rollupOutput.depositRoot,
          depositCount: rollupOutput.depositCount,
          totalTxFees: rollupOutput.totalTxFees,
          txFeeReceiver: input.txFeeReceiverNote.ownerPk,
        });
        const blockHash = output.generateBlockHash();
        output.blockHash = blockHash;

        return output;
      },
    },
  },
});

class RollupProof extends Experimental.ZkProgram.Proof(BlockProver) {}
