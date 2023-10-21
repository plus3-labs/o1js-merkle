import {
  DeployArgs,
  Field,
  method,
  Provable,
  PublicKey,
  Reducer,
  SmartContract,
  Permissions,
  State,
  state,
  UInt64,
  Poseidon,
} from 'o1js';
import { DepositRollupProof } from './deposit_rollup_prover';
import { AccountRequired, AssetId, NoteType } from '../models/constants';
import {
  DepositEvent,
  DepositRollupState,
  DepositRollupStateTransition,
  EncryptedNoteFieldData,
} from './models';
import { ValueNote } from '../models/value_note';
import { DEPOSIT_TREE_INIT_ROOT } from '../constants';
import { AnomixVaultContract } from '../vault_contract/vault_contract';

export class AnomixEntryContract extends SmartContract {
  @state(DepositRollupState) depositState = State<DepositRollupState>();
  @state(PublicKey) vaultContractAddress = State<PublicKey>();
  // @state(PublicKey) rollupContractAddress = State<PublicKey>();

  reducer = Reducer({ actionType: Field });

  events = {
    deposit: DepositEvent,
    depositStateUpdate: DepositRollupStateTransition,
  };

  deployEntryContract(args: DeployArgs, vaultContractAddress: PublicKey) {
    super.deploy(args);
    this.vaultContractAddress.set(vaultContractAddress);
    this.depositState.set(
      new DepositRollupState({
        depositRoot: DEPOSIT_TREE_INIT_ROOT,
        currentIndex: Field(0),
        currentActionsHash: Reducer.initialActionState,
      })
    );
    this.account.permissions.set({
      ...Permissions.default(),
      editState: Permissions.proof(),
      editActionState: Permissions.proof(),
      //setVerificationKey: Permissions.proof(),
    });
  }

  @method deposit(
    payerAddress: PublicKey,
    note: ValueNote,
    encryptedNoteData: EncryptedNoteFieldData
  ) {
    Provable.log('start deposit');
    note.assetId.assertEquals(AssetId.MINA, 'assetId is not MINA');
    note.noteType.assertEquals(NoteType.NORMAL, 'noteType is not NORMAL');
    note.value.assertGreaterThan(UInt64.zero, 'note value is zero');
    note.ownerPk.isEmpty().assertFalse('The ownerPk of note is empty');
    note.accountRequired
      .equals(AccountRequired.REQUIRED)
      .or(note.accountRequired.equals(AccountRequired.NOTREQUIRED))
      .assertTrue('The accountRequired of note is not REQUIRED or NOTREQUIRED');
    note.inputNullifier.assertEquals(
      Poseidon.hash(payerAddress.toFields()),
      'The inputNullifier of note is not equal to hash of payer address'
    );

    Provable.log('check vault contract address');
    let vaultContractAddress = this.vaultContractAddress.getAndAssertEquals();
    vaultContractAddress
      .isEmpty()
      .assertFalse('The vault contract address is empty');

    Provable.log('deposit mina');
    const vaultContract = new AnomixVaultContract(vaultContractAddress);
    vaultContract.deposit(payerAddress, note.value);

    Provable.log('calculate note commitment');
    const noteCommitment = note.commitment();

    Provable.log('emit deposit event');
    this.emitEvent(
      'deposit',
      new DepositEvent({
        noteCommitment: noteCommitment,
        assetId: note.assetId,
        depositValue: note.value,
        sender: payerAddress,
        encryptedNoteData,
      })
    );

    Provable.log('dispatch note commitment to reducer');
    this.reducer.dispatch(noteCommitment);
  }

  @method updateDepositState(proof: DepositRollupProof) {
    proof.verify();

    this.account.actionState.assertEquals(
      proof.publicOutput.target.currentActionsHash
    );
    let state = this.depositState.getAndAssertEquals();
    proof.publicOutput.source.assertEquals(state);
    this.depositState.set(proof.publicOutput.target);
    this.emitEvent('depositStateUpdate', proof.publicOutput);
    Provable.log('update deposit state success');
  }

  // @method updateVerificationKey(
  //   verificationKey: VerificationKey,
  //   operatorAddress: PublicKey,
  //   operatorSign: Signature
  // ) {
  //   const rollupContractAddress =
  //     this.rollupContractAddress.getAndAssertEquals();

  //   // check operator address of rollup contract
  //   const operatorFields = operatorAddress.toFields();
  //   const accountUpdate = AccountUpdate.create(rollupContractAddress);
  //   AccountUpdate.assertEquals(
  //     accountUpdate.body.preconditions.account.state[5],
  //     operatorFields[0]
  //   );
  //   AccountUpdate.assertEquals(
  //     accountUpdate.body.preconditions.account.state[6],
  //     operatorFields[1]
  //   );

  //   operatorSign
  //     .verify(operatorAddress, [verificationKey.hash])
  //     .assertTrue('The operator signature is invalid');
  //   this.account.verificationKey.set(verificationKey);
  // }
}
