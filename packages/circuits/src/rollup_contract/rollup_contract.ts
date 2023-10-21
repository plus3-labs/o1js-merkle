import { RollupProof } from '../block_prover/block_prover';
import {
  Bool,
  Permissions,
  Field,
  method,
  Provable,
  PublicKey,
  Signature,
  SmartContract,
  State,
  state,
  UInt32,
  DeployArgs,
  AccountUpdate,
} from 'o1js';
import { RollupBlockEvent, RollupState } from './models';
import { BlockProveOutput } from '../block_prover/models';
import {
  DATA_TREE_INIT_ROOT,
  NULLIFIER_TREE_INIT_ROOT,
  ROOT_TREE_INIT_ROOT,
} from '../constants';

export class AnomixRollupContract extends SmartContract {
  static entryContractAddress: PublicKey;

  static escapeIntervalSlots = UInt32.from(40); // default: every 40 slots, 120 minutes
  static escapeSlots = UInt32.from(20); // default: 20 slots(There may be redundancy for an additional 10 slots), 60 minutes, the period during which third parties are allowed to publish blocks

  @state(RollupState) state = State<RollupState>();
  @state(Field) blockHeight = State<Field>();
  @state(PublicKey) operatorAddress = State<PublicKey>();

  events = {
    blockEvent: RollupBlockEvent,
  };

  deployRollup(args: DeployArgs, operatorAddress: PublicKey) {
    super.deploy(args);
    this.operatorAddress.set(operatorAddress);
    this.state.set(
      new RollupState({
        dataRoot: DATA_TREE_INIT_ROOT,
        nullifierRoot: NULLIFIER_TREE_INIT_ROOT,
        dataRootsRoot: ROOT_TREE_INIT_ROOT,
        depositStartIndex: Field(0),
      })
    );
    this.blockHeight.set(Field(0));
    this.account.permissions.set({
      ...Permissions.default(),
      editState: Permissions.proof(),
      receive: Permissions.none(),
      //setVerificationKey: Permissions.proof(),
    });
  }

  public get entryAddress() {
    if (!AnomixRollupContract.entryContractAddress) {
      throw new Error('Anomix entry contract address unknown!');
    }
    return AnomixRollupContract.entryContractAddress;
  }

  @method updateRollupState(
    proof: RollupProof,
    operatorSign: Signature,
    entryDepositRoot: Field
  ) {
    Provable.log('updateRollupState...');
    Provable.log('entryDepositRoot: ', entryDepositRoot);
    proof.verify();

    const globalSlots = this.network.globalSlotSinceGenesis.get();
    Provable.log('globalSlots: ', globalSlots);
    this.network.globalSlotSinceGenesis.assertBetween(
      globalSlots,
      globalSlots.add(10)
    );

    const output = proof.publicOutput;
    Provable.log('proof output: ', output);
    const signMessage = BlockProveOutput.toFields(output);
    const operatorAddress = this.operatorAddress.getAndAssertEquals();
    Provable.log('operatorAddress: ', operatorAddress);

    Provable.log(
      'AnomixRollupContract.escapeIntervalSlots: ',
      AnomixRollupContract.escapeIntervalSlots
    );
    Provable.log(
      'AnomixRollupContract.escapeSlots: ',
      AnomixRollupContract.escapeSlots
    );
    Provable.if(
      globalSlots
        .mod(AnomixRollupContract.escapeIntervalSlots)
        .lessThanOrEqual(AnomixRollupContract.escapeSlots),
      Bool,
      Bool(true),
      operatorSign.verify(operatorAddress, signMessage)
    ).assertTrue(
      'The operator signature is invalid when the current slot is not in the escape period'
    );

    //const entryDepositRoot = this.entryContract.getDepositRoot();
    const accountUpdate = AccountUpdate.create(this.entryAddress);
    AccountUpdate.assertEquals(
      accountUpdate.body.preconditions.account.state[0],
      entryDepositRoot
    );

    Provable.if(
      output.depositCount.greaterThan(0),
      output.depositRoot.equals(entryDepositRoot),
      Bool(true)
    ).assertTrue('depositRoot is not equal to entry contract depositRoot');

    const state = this.state.getAndAssertEquals();
    Provable.log('state: ', state);
    Provable.equal(
      RollupState,
      state,
      output.stateTransition.source
    ).assertTrue('stateTransition.source is not equal to current state');
    this.state.set(output.stateTransition.target);

    let currentBlockNumber = this.blockHeight.getAndAssertEquals();
    Provable.log('currentBlockNumber: ', currentBlockNumber);

    this.blockHeight.set(currentBlockNumber.add(1));
    this.emitEvent(
      'blockEvent',
      new RollupBlockEvent({
        blockNumber: currentBlockNumber,
        blockHash: output.blockHash,
        rollupSize: output.rollupSize,
        stateTransition: output.stateTransition,
        depositRoot: output.depositRoot,
        depositCount: output.depositCount,
        totalTxFees: output.totalTxFees,
        txFeeReceiver: output.txFeeReceiver,
      })
    );
    Provable.log('anomix rollup success');
  }

  // @method updateOperatorAddress(
  //   newOperatorAddress: PublicKey,
  //   oldOperatorSign: Signature
  // ) {
  //   const currentOperatorAddress = this.operatorAddress.getAndAssertEquals();
  //   oldOperatorSign
  //     .verify(currentOperatorAddress, newOperatorAddress.toFields())
  //     .assertTrue('The old operator signature is invalid');
  //   this.operatorAddress.set(newOperatorAddress);
  // }

  // @method updateVerificationKey(
  //   verificationKey: VerificationKey,
  //   operatorSign: Signature
  // ) {
  //   const currentOperatorAddress = this.operatorAddress.getAndAssertEquals();
  //   operatorSign
  //     .verify(currentOperatorAddress, [verificationKey.hash])
  //     .assertTrue('The operator signature is invalid');
  //   this.account.verificationKey.set(verificationKey);
  // }
}
