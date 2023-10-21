import {
  isReady,
  method,
  Mina,
  AccountUpdate,
  PrivateKey,
  SmartContract,
  PublicKey,
  UInt64,
  Int64,
  Experimental,
  Permissions,
  DeployArgs,
  VerificationKey,
  TokenId,
  state,
  State,
  Field,
  Bool,
  Provable,
} from 'o1js';

class TokenContract extends SmartContract {
  static withDrawAccountVerifyKey: VerificationKey;

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.account.permissions.set({
      ...Permissions.default(),
      access: Permissions.proof(),
    });
    //this.balance.addInPlace(UInt64.from(initialBalance));
  }

  @method firstWithDraw(user: PublicKey) {
    let tokenId = this.token.id;
    let deployUpdate = Experimental.createChildAccountUpdate(
      this.self,
      user,
      tokenId
    );
    deployUpdate.account.permissions.set({
      receive: Permissions.none(),
      send: Permissions.proof(),
      editState: Permissions.proof(),
      editActionState: Permissions.proof(),
      setDelegate: Permissions.proof(),
      setPermissions: Permissions.proof(),
      setVerificationKey: Permissions.proof(),
      setZkappUri: Permissions.proof(),
      setTokenSymbol: Permissions.proof(),
      incrementNonce: Permissions.proof(),
      setVotingFor: Permissions.proof(),
      setTiming: Permissions.proof(),
      access: Permissions.none(),
    });
    deployUpdate.account.verificationKey.set(
      TokenContract.withDrawAccountVerifyKey
    );
    deployUpdate.account.isNew.assertEquals(Bool(true));
    AccountUpdate.setValue(deployUpdate.body.update.appState[0], Field(1));
    AccountUpdate.setValue(deployUpdate.body.update.appState[1], Field(1));
    deployUpdate.requireSignature();

    const u = AccountUpdate.createSigned(user);
    u.balance.subInPlace(1000_000_000);
    // const userUpdate = AccountUpdate.createSigned(user);
    // userUpdate.balance.addInPlace(3000_000_000);
    // this.balance.subInPlace(3000_000_000);
    this.send({ to: u, amount: 2000_000_000 });
  }

  @method approveUpdateState(
    user: PublicKey,
    callback: Experimental.Callback<any>
  ) {
    let accountUpdate = this.approve(
      callback,
      AccountUpdate.Layout.AnyChildren
    );

    let tokenId = this.token.id;
    accountUpdate.body.tokenId.assertEquals(tokenId);
    accountUpdate.body.publicKey.assertEquals(user);
    accountUpdate.body.update.appState[0].isSome.assertTrue('appState[0]');
    accountUpdate.body.update.appState[1].isSome.assertTrue('appState[1]');
  }

  @method approveUpdateState2(user: PublicKey, update: AccountUpdate) {
    this.approve(update, AccountUpdate.Layout.AnyChildren);

    let tokenId = this.token.id;
    update.body.tokenId.assertEquals(tokenId);
    update.body.publicKey.assertEquals(user);
    update.body.update.appState[0].isSome.assertTrue('appState[0]');
    update.body.update.appState[1].isSome.assertTrue('appState[1]');
  }

  @method updateState(user: PublicKey, x: Field, y: Field) {
    let withDrawAccount = new WithdrawAccount(user, this.token.id);
    const nullStartIndex = withDrawAccount.updateState(x, y);
    Provable.log('nullStartIndex: ', nullStartIndex);

    this.approveUpdateState2(user, withDrawAccount.self);
  }
}

class WithdrawAccount extends SmartContract {
  @state(Field) nullifierRoot = State<Field>();
  @state(Field) nullStartIndex = State<Field>();

  @method updateState(x: Field, y: Field): Field {
    // TODO: in a real zkApp, here would be application-specific checks for whether we want to allow sending tokens

    const nullifierRoot = this.nullifierRoot.getAndAssertEquals();
    nullifierRoot.assertGreaterThanOrEqual(1, 'nullifierRoot');
    const nullStartIndex = this.nullStartIndex.getAndAssertEquals();
    nullStartIndex.assertGreaterThanOrEqual(1, 'nullStartIndex');
    this.nullifierRoot.set(x);
    this.nullStartIndex.set(y);
    this.self.body.mayUseToken = AccountUpdate.MayUseToken.ParentsOwnToken;

    return nullStartIndex;
  }
}

let Local = Mina.LocalBlockchain();
Mina.setActiveInstance(Local);

let feePayer = Local.testAccounts[0].publicKey;
let feePayerKey = Local.testAccounts[0].privateKey;
let initialBalance = 10_000_000;

let tokenZkAppKey = Local.testAccounts[1].privateKey;
let tokenZkAppAddress = Local.testAccounts[1].publicKey;

let withDrawAccountKey = Local.testAccounts[2].privateKey;
let withDrawAccountAddress = withDrawAccountKey.toPublicKey();

let tokenZkApp = new TokenContract(tokenZkAppAddress);
let tokenId = tokenZkApp.token.id;

let withDrawZkapp = new WithdrawAccount(withDrawAccountAddress, tokenId);
let tx;

console.log('tokenZkAppAddress', tokenZkAppAddress.toBase58());
console.log('withDrawAccountAddress', withDrawAccountAddress.toBase58());
console.log('feePayer', feePayer.toBase58());
console.log('-------------------------------------------');

console.log('compile (WithDrawAccount)');
await WithdrawAccount.compile();

TokenContract.withDrawAccountVerifyKey = WithdrawAccount._verificationKey!;
console.log('compile (TokenContract)');
await TokenContract.compile();

console.log('deploy tokenZkApp');
tx = await Local.transaction(feePayer, () => {
  //AccountUpdate.fundNewAccount(feePayer, 1);
  tokenZkApp.deploy({ zkappKey: tokenZkAppKey });
});
tx.sign([feePayerKey]);
await tx.send();

console.log('deploy WithDrawAccount');
tx = await Local.transaction(feePayer, () => {
  //   AccountUpdate.fundNewAccount(feePayer, 1);
  tokenZkApp.firstWithDraw(withDrawAccountAddress);
});
console.log('deploy WithDrawAccount (proof)');

await tx.prove();
tx.sign([feePayerKey, withDrawAccountKey]);
await tx.send();

console.log('approve update state');
tx = await Local.transaction(feePayer, () => {
  //   let approveUpdateStateCallback = Experimental.Callback.create(
  //     withDrawZkapp,
  //     'updateState',
  //     [Field(3), Field(2)]
  //   );
  //   // we call the token contract with the callback
  //   tokenZkApp.approveUpdateState(
  //     withDrawAccountAddress,
  //     approveUpdateStateCallback
  //   );

  //withDrawZkapp.updateState(Field(3), Field(2));

  tokenZkApp.updateState(withDrawAccountAddress, Field(3), Field(2));
});
console.log('approve update state (proof)');

await tx.prove();
tx.sign([feePayerKey]);
await tx.send();

console.log(
  `withDraw account state 0 for tokenId: ${TokenId.toBase58(tokenId)}`,
  Mina.getAccount(withDrawAccountAddress, tokenId).zkapp?.appState[0].toString()
);

console.log(
  `withDraw account state 1 for tokenId: ${TokenId.toBase58(tokenId)}`,
  Mina.getAccount(withDrawAccountAddress, tokenId).zkapp?.appState[1].toString()
);

console.log(
  `withDraw account mina balance: `,
  Mina.getBalance(withDrawAccountAddress).toString()
);
