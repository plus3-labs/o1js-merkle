import { DATA_TREE_HEIGHT } from '../constants';
import { AccountNote } from '../models/account';
import {
  AccountOperationType,
  AccountRequired,
  ActionType,
  AssetId,
  DUMMY_FIELD,
  NoteType,
} from '../models/constants';
import {
  calculateNoteNullifier,
  checkMembership,
  checkMembershipAndAssert,
} from '../utils/utils';
import {
  Bool,
  Experimental,
  Field,
  Poseidon,
  Provable,
  PublicKey,
  UInt64,
} from 'o1js';
import {
  JoinSplitAccountInput,
  JoinSplitDepositInput,
  JoinSplitOutput,
  JoinSplitSendInput,
} from './models';

export { JoinSplitProver, JoinSplitProof };

let JoinSplitProver = Experimental.ZkProgram({
  publicOutput: JoinSplitOutput,

  methods: {
    dummy: {
      privateInputs: [],
      method() {
        return JoinSplitOutput.zero();
      },
    },
    deposit: {
      privateInputs: [JoinSplitDepositInput],

      method(depositInput: JoinSplitDepositInput) {
        Provable.log('depositInput: ', depositInput);

        const actionType = ActionType.DEPOSIT;
        const nullifier1 = DUMMY_FIELD;
        const nullifier2 = DUMMY_FIELD;
        const outputNoteCommitment1 = depositInput.depositNoteCommitment;
        const outputNoteCommitment2 = DUMMY_FIELD;

        const zeroValue = UInt64.zero;
        const txFee = zeroValue;
        const txFeeAssetId = AssetId.MINA;

        depositInput.publicValue.assertGreaterThan(
          zeroValue,
          'publicValue is 0'
        );
        depositInput.publicAssetId.assertEquals(
          AssetId.MINA,
          'publicAssetId is not MINA'
        );

        // depositInput.handledDepositIndex.assertLessThanOrEqual(
        //   depositInput.depositNoteIndex,
        //   'handledDepositIndex is greater than depositNoteIndex'
        // );

        checkMembershipAndAssert(
          outputNoteCommitment1,
          depositInput.depositNoteIndex,
          depositInput.depositWitness,
          depositInput.depositRoot,
          'OutputNote1 commitment check membership failed'
        );

        return new JoinSplitOutput({
          actionType,
          outputNoteCommitment1,
          outputNoteCommitment2,
          nullifier1,
          nullifier2,
          publicValue: depositInput.publicValue,
          publicOwner: depositInput.publicOwner,
          publicAssetId: depositInput.publicAssetId,
          dataRoot: depositInput.dataRoot,
          txFee,
          txFeeAssetId,
          depositRoot: depositInput.depositRoot,
          depositIndex: depositInput.depositNoteIndex,
          //handledDepositIndex: depositInput.handledDepositIndex,
        });
      },
    },

    send: {
      privateInputs: [JoinSplitSendInput],

      method(sendInput: JoinSplitSendInput) {
        Provable.log('sendInput: ', sendInput);
        const actionType = sendInput.actionType;

        const actionTypeIsSend = actionType.equals(ActionType.SEND);
        Provable.log('actionTypeIsSend: ', actionTypeIsSend);

        const actionTypeIsWithdraw = actionType.equals(ActionType.WITHDRAW);
        Provable.log('actionTypeIsWithdraw: ', actionTypeIsWithdraw);

        actionTypeIsSend
          .or(actionTypeIsWithdraw)
          .assertTrue('Invalid actionType');

        const publicAssetId = Provable.if(
          actionTypeIsWithdraw,
          Field,
          AssetId.MINA,
          DUMMY_FIELD
        );
        Provable.log('publicAssetId: ', publicAssetId);

        const publicValue = sendInput.publicValue;
        const publicOwner = sendInput.publicOwner;
        const inputNote1 = sendInput.inputNote1;
        const inputNote2 = sendInput.inputNote2;
        const outputNote1 = sendInput.outputNote1;
        const outputNote2 = sendInput.outputNote2;

        // outputNote1.accountRequired
        //   .greaterThanOrEqual(0)
        //   .assertTrue('Invalid outputNote1 accountRequired');
        // outputNote1.accountRequired
        //   .lessThan(3)
        //   .assertTrue('Invalid outputNote1 accountRequired');
        // outputNote2.accountRequired
        //   .greaterThanOrEqual(0)
        //   .assertTrue('Invalid outputNote2 accountRequired');
        // outputNote2.accountRequired
        //   .lessThan(3)
        //   .assertTrue('Invalid outputNote2 accountRequired');

        // TODO no check account membership

        Provable.log('InputNote1 noteType: ', inputNote1.noteType);
        inputNote1.noteType.assertEquals(NoteType.NORMAL);
        Provable.log('InputNote2 noteType: ', inputNote2.noteType);
        inputNote2.noteType.assertEquals(NoteType.NORMAL);

        const isPublicOwnerEmpty = publicOwner.isEmpty();
        Provable.log('isPublicOwnerEmpty: ', isPublicOwnerEmpty);

        // sendInput.assetId.assertEquals(
        //   inputNote1.assetId,
        //   'SendInput assetId not equal to inputNote1 assetId'
        // );
        // sendInput.assetId.assertEquals(
        //   outputNote1.assetId,
        //   'SendInput assetId not equal to ouputNote1 assetId'
        // );

        Provable.log('OutputNote2 assetId: ', outputNote2.assetId);
        Provable.if(
          outputNote2.value.equals(UInt64.zero),
          Bool,
          outputNote2.assetId.equals(DUMMY_FIELD),
          outputNote2.assetId.equals(sendInput.assetId)
        ).assertTrue('Invalid outputNote2 assetId');

        const [
          checkNoteType,
          checkPublicValue,
          checkPublicOwner,
          checkCreatorPk,
        ] = Provable.if(
          actionTypeIsWithdraw,
          Provable.Array(Bool, 4),
          [
            outputNote1.noteType
              .equals(NoteType.WITHDRAWAL)
              .and(outputNote2.noteType.equals(NoteType.NORMAL)),
            publicValue.greaterThan(UInt64.zero),
            isPublicOwnerEmpty.not(),
            outputNote1.creatorPk.isEmpty(),
          ],
          [
            outputNote1.noteType
              .equals(NoteType.NORMAL)
              .and(outputNote2.noteType.equals(NoteType.NORMAL)),
            publicValue.equals(UInt64.zero),
            isPublicOwnerEmpty,
            Bool(true),
          ]
        );
        checkNoteType.assertTrue('Invalid outputNote noteType');
        checkPublicValue.assertTrue('Invalid publicValue');
        checkPublicOwner.assertTrue('Invalid publicOwner');
        checkCreatorPk.assertTrue(
          'The CreatorPk of outputNote1 must be empty when actiontype is withdraw'
        );

        const maxIndex = 2 ** DATA_TREE_HEIGHT;
        sendInput.inputNote1Index.assertLessThan(
          maxIndex,
          'inputNote1Index is greater than maxIndex'
        );
        sendInput.inputNote2Index.assertLessThan(
          maxIndex,
          'inputNote2Index is greater than maxIndex'
        );
        sendInput.accountNoteIndex.assertLessThan(
          maxIndex,
          'accountNoteIndex is greater than maxIndex'
        );

        sendInput.accountRequired.assertLessThan(
          3,
          'accountRequired is greater than 2'
        );
        sendInput.inputNotesNum.assertGreaterThanOrEqual(
          1,
          'inputNotesNum < 1'
        );
        sendInput.inputNotesNum.assertLessThanOrEqual(2, 'inputNotesNum > 2');

        const inputNote1Commitment = inputNote1.commitment();
        const inputNote2Commitment = inputNote2.commitment();
        const outputNote1Commitment = outputNote1.commitment();
        Provable.log('OutputNote1Commitment: ', outputNote1Commitment);

        const outputNote2Commitment = Provable.if(
          outputNote2.value.equals(UInt64.zero),
          Field,
          DUMMY_FIELD,
          outputNote2.commitment()
        );
        Provable.log('OutputNote2Commitment: ', outputNote2Commitment);

        inputNote1Commitment.assertNotEquals(
          inputNote2Commitment,
          'InputNote1Commitment can not equal to inputNote2Commitment'
        );

        const accountPk = sendInput.accountPrivateKey.toPublicKey();

        const isAccountRequired = sendInput.accountRequired.equals(
          AccountRequired.REQUIRED
        );
        Provable.log('isAccountRequired: ', isAccountRequired);

        const signerPk = Provable.if(
          isAccountRequired,
          PublicKey,
          sendInput.signingPk,
          accountPk
        );
        Provable.log('signerPk: ', signerPk);

        const accountNote = new AccountNote({
          aliasHash: sendInput.aliasHash,
          acctPk: accountPk,
          signingPk: signerPk,
        });
        Provable.log('accountNote: ', accountNote);

        const accountNoteCommitment = accountNote.commitment();
        Provable.log('accountNoteCommitment: ', accountNoteCommitment);

        // verify account membership
        // Provable.if(
        //   isAccountRequired,
        //   Bool,
        //   checkMembership(
        //     accountNoteCommitment,
        //     sendInput.accountNoteIndex,
        //     sendInput.accountNoteWitness,
        //     sendInput.dataRoot
        //   ),
        //   Bool(true)
        // ).assertTrue(
        //   'AccountNote commitment check membership failed when accountRequired is true'
        // );

        Provable.log('accountPk: ', accountPk);
        Provable.log('inputNote1.ownerPk: ', inputNote1.ownerPk);
        accountPk.assertEquals(inputNote1.ownerPk);
        //accountPk.assertEquals(inputNote2.ownerPk);

        const inputNoteNumIs2 = sendInput.inputNotesNum.equals(2);
        Provable.log('inputNoteNumIs2: ', inputNoteNumIs2);

        const checkInputNote1AccountRequired = Provable.if(
          isAccountRequired,
          Bool,
          Bool(true),
          inputNote1.accountRequired.equals(AccountRequired.NOTREQUIRED)
        );
        checkInputNote1AccountRequired.assertTrue(
          'Invalid inputNote1 accountRequired'
        );

        const [assetIdMatch, accountRequiredMatch, inputNote2OwnerMatch] =
          Provable.if(
            inputNoteNumIs2,
            Provable.Array(Bool, 3),
            [
              inputNote1.assetId.equals(inputNote2.assetId),
              Provable.if(
                isAccountRequired,
                Bool,
                inputNote2.accountRequired.equals(DUMMY_FIELD).not(),
                inputNote2.accountRequired.equals(AccountRequired.NOTREQUIRED)
              ),
              accountPk.equals(inputNote2.ownerPk),
            ],
            [Bool(true), Bool(true), Bool(true)]
          );
        assetIdMatch.assertTrue(
          'The assetId of inputNote1 and inputNote2 does not match'
        );
        accountRequiredMatch.assertTrue(
          'The accountRequired of inputNote2 and input accountRequired does not match'
        );
        inputNote2OwnerMatch.assertTrue(
          'The ownerPk of inputNote2 does not match'
        );

        // Provable.if(
        //   outputNote1.creatorPk.isEmpty(),
        //   Bool,
        //   Bool(true),
        //   accountPk.equals(outputNote1.creatorPk)
        // ).assertTrue('The creatorPk of outputNote1 does not match');

        // Provable.if(
        //   outputNote2.creatorPk.isEmpty(),
        //   Bool,
        //   Bool(true),
        //   accountPk.equals(outputNote2.creatorPk)
        // ).assertTrue('The creatorPk of outputNote2 does not match');

        const totalInValue = inputNote1.value.add(inputNote2.value);
        Provable.log('totalInValue: ', totalInValue);
        const totalOutValue = outputNote1.value.add(outputNote2.value);
        Provable.log('totalOutValue: ', totalOutValue);

        totalInValue.assertGreaterThan(
          totalOutValue,
          'totalInValue is less than or equal totalOutValue'
        );
        const txFee = totalInValue.sub(totalOutValue);
        Provable.log('txFee: ', txFee);

        const inputNote1InUse = sendInput.inputNotesNum.greaterThanOrEqual(1);
        Provable.log('inputNote1InUse: ', inputNote1InUse);
        const inputNote2InUse = inputNoteNumIs2;
        Provable.log('inputNote2InUse: ', inputNote2InUse);

        // Provable.if(
        //   inputNote1InUse,
        //   Bool,
        //   checkMembership(
        //     inputNote1Commitment,
        //     sendInput.inputNote1Index,
        //     sendInput.inputNote1Witness,
        //     sendInput.dataRoot
        //   ),
        //   inputNote1.value.equals(UInt64.zero)
        // ).assertTrue(
        //   'InputNote1 commitment check membership failed or inputNote1 value is not 0'
        // );

        // Provable.if(
        //   inputNote2InUse,
        //   Bool,
        //   checkMembership(
        //     inputNote2Commitment,
        //     sendInput.inputNote2Index,
        //     sendInput.inputNote2Witness,
        //     sendInput.dataRoot
        //   ),
        //   inputNote2.value.equals(UInt64.zero)
        // ).assertTrue(
        //   'InputNote2 commitment check membership failed or inputNote2 value is not 0'
        // );

        const nullifier1 = calculateNoteNullifier(
          inputNote1Commitment,
          sendInput.accountPrivateKey,
          inputNote1InUse
        );
        Provable.log('nullifier1: ', nullifier1);

        const nullifier2 = calculateNoteNullifier(
          inputNote2Commitment,
          sendInput.accountPrivateKey,
          inputNote2InUse
        );
        Provable.log('nullifier2: ', nullifier2);

        outputNote1.inputNullifier.assertEquals(
          nullifier1,
          'outputNote1.inputNullifier not equal to nullifier1'
        );
        outputNote2.inputNullifier.assertEquals(
          nullifier2,
          'outputNote2.inputNullifier not equal to nullifier2'
        );

        const message = [
          outputNote1Commitment,
          outputNote2Commitment,
          nullifier1,
          nullifier2,
          publicAssetId,
          ...publicValue.toFields(),
          ...publicOwner.toFields(),
        ];

        sendInput.signature.verify(signerPk, message).assertTrue('Invalid sig');

        return new JoinSplitOutput({
          actionType,
          outputNoteCommitment1: outputNote1Commitment,
          outputNoteCommitment2: outputNote2Commitment,
          nullifier1,
          nullifier2,
          publicValue,
          publicOwner,
          publicAssetId,
          dataRoot: sendInput.dataRoot,
          txFee,
          txFeeAssetId: publicAssetId,
          depositRoot: DUMMY_FIELD,
          depositIndex: DUMMY_FIELD,
          //handledDepositIndex: DUMMY_FIELD,
        });
      },
    },

    operateAccount: {
      privateInputs: [JoinSplitAccountInput],

      method(input: JoinSplitAccountInput) {
        Provable.log('operateAccount input: ', input);

        const operationType = input.operationType;
        operationType.assertLessThan(4, 'operationType is greater than 3');

        input.newAccountPk
          .equals(input.newSigningPk1)
          .not()
          .assertTrue('newAccountPk is equal to newSigningPk1');
        input.newAccountPk
          .equals(input.newSigningPk2)
          .not()
          .assertTrue('newAccountPk is equal to newSigningPk2');

        const operationTypeIsCreate = operationType.equals(
          AccountOperationType.CREATE
        );
        Provable.log('operationTypeIsCreate: ', operationTypeIsCreate);

        const operationTypeIsMigrate = operationType.equals(
          AccountOperationType.MIGRATE
        );
        Provable.log('operationTypeIsMigrate: ', operationTypeIsMigrate);

        Provable.if(
          operationTypeIsMigrate.not(),
          Bool,
          input.accountPk.equals(input.newAccountPk),
          Bool(true)
        ).assertTrue('accountPk is not equal to newAccountPk');

        const nullifier1 = Provable.if(
          operationTypeIsCreate,
          Field,
          Poseidon.hash([input.aliasHash]),
          DUMMY_FIELD
        );
        Provable.log('nullifier1: ', nullifier1);

        const nullifier2 = Provable.if(
          operationTypeIsCreate.or(operationTypeIsMigrate),
          Field,
          Poseidon.hash(input.newAccountPk.toFields()),
          DUMMY_FIELD
        );
        Provable.log('nullifier2: ', nullifier2);

        let signer = input.signingPk;
        Provable.log('signer: ', signer);

        const accountNote = new AccountNote({
          aliasHash: input.aliasHash,
          acctPk: input.accountPk,
          signingPk: signer,
        });
        Provable.log('accountNote: ', accountNote);

        const accountNoteCommitment = accountNote.commitment();
        Provable.log('accountNoteCommitment: ', accountNoteCommitment);

        const outputNote1 = new AccountNote({
          aliasHash: input.aliasHash,
          acctPk: input.newAccountPk,
          signingPk: input.newSigningPk1,
        });
        Provable.log('outputNote1: ', outputNote1);
        const outputNoteCommitment1 = outputNote1.commitment();
        Provable.log('outputNoteCommitment1: ', outputNoteCommitment1);

        const outputNote2 = new AccountNote({
          aliasHash: input.aliasHash,
          acctPk: input.newAccountPk,
          signingPk: input.newSigningPk2,
        });
        Provable.log('outputNote2: ', outputNote2);
        const outputNoteCommitment2 = outputNote2.commitment();
        Provable.log('outputNoteCommitment2: ', outputNoteCommitment2);

        const message = [
          input.aliasHash,
          ...input.accountPk.toFields(),
          ...input.newAccountPk.toFields(),
          ...input.newSigningPk1.toFields(),
          ...input.newSigningPk2.toFields(),
          nullifier1,
          nullifier2,
        ];

        input.signature.verify(signer, message).assertTrue('Invalid sig');

        // Provable.if(
        //   operationTypeIsCreate.not(),
        //   Bool,
        //   checkMembership(
        //     accountNoteCommitment,
        //     input.accountNoteIndex,
        //     input.accountNoteWitness,
        //     input.dataRoot
        //   ),
        //   Bool(true)
        // ).assertTrue('AccountNote commitment check membership failed');

        return new JoinSplitOutput({
          actionType: ActionType.ACCOUNT,
          outputNoteCommitment1,
          outputNoteCommitment2,
          nullifier1,
          nullifier2,
          publicValue: UInt64.zero,
          publicOwner: PublicKey.empty(),
          publicAssetId: DUMMY_FIELD,
          dataRoot: input.dataRoot,
          txFee: UInt64.zero,
          txFeeAssetId: AssetId.MINA,
          depositRoot: DUMMY_FIELD,
          depositIndex: DUMMY_FIELD,
          //handledDepositIndex: DUMMY_FIELD,
        });
      },
    },
  },
});

class JoinSplitProof extends Experimental.ZkProgram.Proof(JoinSplitProver) {}
