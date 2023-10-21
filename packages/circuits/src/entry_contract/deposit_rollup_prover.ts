import { INITIAL_LEAF } from '@anomix/merkle-tree';
import {
  AccountUpdate,
  Bool,
  Empty,
  Experimental,
  Field,
  Provable,
  SelfProof,
  Struct,
} from 'o1js';
import {
  DepositActionBatch,
  DepositRollupState,
  DepositRollupStateTransition,
} from './models';
import { checkMembership } from '../utils/utils';

class TempParams extends Struct({
  isActionNonExist: Bool,
  depositRoot: Field,
  currentIndex: Field,
}) {}

let DepositRollupProver = Experimental.ZkProgram({
  publicOutput: DepositRollupStateTransition,

  methods: {
    commitActionBatch: {
      privateInputs: [DepositRollupState, DepositActionBatch],

      method(state: DepositRollupState, actionBatch: DepositActionBatch) {
        let currDepositTreeRoot = state.depositRoot;
        let currIndex = state.currentIndex;
        let currActionsHash = state.currentActionsHash;

        // Process each action in the batch
        for (let i = 0, len = DepositActionBatch.batchSize; i < len; i++) {
          const currAction = actionBatch.actions[i];
          const currWitness = actionBatch.merkleWitnesses[i];
          const isDummyData = currAction.equals(0);

          // calculate new actions hash
          let eventHash = AccountUpdate.Actions.hash([currAction.toFields()]);
          currActionsHash = Provable.if(
            isDummyData,
            currActionsHash,
            AccountUpdate.Actions.updateSequenceState(
              currActionsHash,
              eventHash
            )
          );

          // check non-membership
          // const isNonExist = checkMembership(
          //   INITIAL_LEAF,
          //   currIndex,
          //   currWitness,
          //   currDepositTreeRoot
          // );
          const isNonExist = Bool(true);

          let temp = Provable.if(
            isDummyData,
            TempParams,
            new TempParams({
              isActionNonExist: Bool(true),
              depositRoot: currDepositTreeRoot,
              currentIndex: currIndex,
            }),
            new TempParams({
              isActionNonExist: isNonExist,
              depositRoot: currWitness.calculateRoot(currAction, currIndex),
              currentIndex: currIndex.add(1),
            })
          );

          temp.isActionNonExist.assertTrue(
            'action is already exist in current index'
          );
          currDepositTreeRoot = temp.depositRoot;
          currIndex = temp.currentIndex;

          Provable.log('currIndex: ', currIndex);
        }

        return new DepositRollupStateTransition({
          source: state,
          target: new DepositRollupState({
            depositRoot: currDepositTreeRoot,
            currentIndex: currIndex,
            currentActionsHash: currActionsHash,
          }),
        });
      },
    },

    merge: {
      privateInputs: [SelfProof, SelfProof],

      method(
        p1: SelfProof<Empty, DepositRollupStateTransition>,
        p2: SelfProof<Empty, DepositRollupStateTransition>
      ) {
        p1.verify();
        p2.verify();

        p1.publicOutput.target.assertEquals(p2.publicOutput.source);

        return new DepositRollupStateTransition({
          source: p1.publicOutput.source,
          target: p2.publicOutput.target,
        });
      },
    },
  },
});

class DepositRollupProof extends Experimental.ZkProgram.Proof(
  DepositRollupProver
) {}

export { DepositRollupProver, DepositRollupProof };
