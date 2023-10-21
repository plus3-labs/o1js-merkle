import {
  AccountUpdate,
  Experimental,
  Field,
  method,
  SmartContract,
  state,
  State,
  VerificationKey,
  Permissions,
  Bool,
  PublicKey,
  PrivateKey,
  Mina,
  DeployArgs,
} from 'o1js';
import { getTestContext } from '../src/test_utils';

export class WithdrawAccount extends SmartContract {
  @state(Field) x = State<Field>();

  @method update(x: Field) {
    this.x.set(x);

    this.self.body.mayUseToken = AccountUpdate.MayUseToken.ParentsOwnToken;
  }
}

export class Manager extends SmartContract {
  static vkHash: Field;

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.account.permissions.set({
      ...Permissions.default(),
      access: Permissions.proof(),
    });
  }

  @method deployAccount(
    verificationKey: VerificationKey,
    userAddress: PublicKey
  ) {
    verificationKey.hash.assertEquals(Manager.vkHash, 'vk hash not match');
    const tokenId = this.token.id;
    const deployUpdate = Experimental.createChildAccountUpdate(
      this.self,
      userAddress,
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

    deployUpdate.account.verificationKey.set(verificationKey);
    deployUpdate.account.isNew.assertEquals(Bool(true));

    AccountUpdate.setValue(deployUpdate.body.update.appState[0], Field(1));
    deployUpdate.requireSignature();
  }

  @method updateState(x: Field, userAddress: PublicKey) {
    const tokenId = this.token.id;
    const withdrawAccount = new WithdrawAccount(userAddress, tokenId);

    withdrawAccount.update(x);

    let update = this.approve(
      withdrawAccount.self,
      AccountUpdate.Layout.AnyChildren
    );

    update.body.update.appState[0].isSome.assertTrue('x should be change');
  }

  // @method updateState(x: Field, userAddress: PublicKey) {
  //   const tokenId = this.token.id;
  //   const account = new WithdrawAccount(userAddress, tokenId);
  //   let callback = Experimental.Callback.create(account, 'update', [x]);
  //   let update = this.approve(callback, AccountUpdate.Layout.AnyChildren);

  //   update.body.update.appState[0].value.assertEquals(x, 'x should be equal');
  // }
}

async function run() {
  console.time('compile withdrawAccount');
  const { verificationKey: withdrawAccountVerifyKey } =
    await WithdrawAccount.compile();
  console.timeEnd('compile withdrawAccount');
  console.log(
    'withdrawAccountVerifyKey',
    JSON.stringify(withdrawAccountVerifyKey)
  );

  Manager.vkHash = withdrawAccountVerifyKey.hash;
  console.time('compile manager');
  const { verificationKey: managerVerifyKey } = await Manager.compile();
  console.timeEnd('compile manager');
  console.log('managerVerifyKey', JSON.stringify(managerVerifyKey));

  const ctx = getTestContext();
  await ctx.initMinaNetwork();

  // const userKey = PrivateKey.fromBase58(
  //   'EKE61ia2RDreftM6EAHZxh8UWizoKA4J7o8G2QnCn824QdZDZiZ8'
  // );
  // const userAddress = PublicKey.fromBase58(
  //   'B62qiyKCKgjkYJ8fdA9U1KRgi3p6GcZmgfjanAvGKpVi7f55vYaiz63'
  // );

  // const managerKey = PrivateKey.fromBase58(
  //   'EKEQxXRYjuWCjCEWJGiSQHcnkesndCaDxDeAcS9YG2ZeRWbUiMQ4'
  // );
  // const managerAddress = PublicKey.fromBase58(
  //   'B62qqtyZAKX5915Huhvuj17u53GFW7LAqiTbBFnnwQJ5VqRkaC6n1Sp'
  // );

  // let userKey = PrivateKey.fromBase58(
  //   'EKFGTLjHH7wfaC8KLDwQ66qzwUbLYjhurSQniS35g4dR7vMmMQym'
  // );
  // let userAddress = PublicKey.fromBase58(
  //   'B62qoydv7FgF2465oQWCMoTNyyuUU493H7Duax66L4cr4ost9asPTGc'
  // );

  // const managerKey = PrivateKey.fromBase58(
  //   'EKEC6iFeZuBvZ3XntNDA7DS2hBEbT92hEVRYE9HuTRmiTsTQGSwV'
  // );
  // const managerAddress = PublicKey.fromBase58(
  //   'B62qqX6uWenp8Yz4QZr3EpAX1vPJmEuX5V1NcWYGGoyE2ikvaNLn2Rm'
  // );

  // let userKey = PrivateKey.fromBase58(
  //   'EKFcrspbPxYkn7q87vumC3Kr7CzWwuvgDa7NfKvMYbw1LH5RmBnT'
  // );
  // let userAddress = PublicKey.fromBase58(
  //   'B62qjSGFkbjazsk7bDyNxrufXtfhvFUEBqYM6Pz6Z9mye46ZY38ew7A'
  // );

  // const managerKey = PrivateKey.fromBase58(
  //   'EKEkGE2YxiZCP8wT53234GupzLaYM7QfzvkTwhrcak6s669t6a8U'
  // );
  // const managerAddress = PublicKey.fromBase58(
  //   'B62qqHyHHXrvEoiwjykqBnDRPGHxXj3ugKxfmMTyJTnRCdCkfZQtDBv'
  // );

  let userKey = PrivateKey.fromBase58(
    'EKEv4rKdub4767Qd5q96yUNgikNNj1xNQR43tHqSMv75N55qbs7w'
  );
  let userAddress = PublicKey.fromBase58(
    'B62qjesVYBinZ3EMXe5YynJ72qYbBfV6GQ1qBP5wSJ28rhwa6stKkAj'
  );

  const managerKey = PrivateKey.fromBase58(
    'EKEoi2MknVE6aKbpi8WxFu54HXennWtreJMhbtt4SxBjuRcNLcwD'
  );
  const managerAddress = PublicKey.fromBase58(
    'B62qpjfgngV2pDH1ScfXPkfbfmEmbFwdFm3QNyjt87csPLbWgepC6jJ'
  );

  const feePayerKey = PrivateKey.fromBase58(
    'EKF93qxJCF3ecjGacpb21ch6pf8HnvDj6LDfThgYF5xZqkKDuHLG'
  );
  const feePayerAddress = PublicKey.fromBase58(
    'B62qp3Aj2xkvCv9rEaBR5geLPs4noHbBniUTvcAq5QSmqe4c5gNijsJ'
  );

  const manager = new Manager(managerAddress);
  const account = new WithdrawAccount(userAddress, manager.token.id);

  let tx = await Mina.transaction(
    {
      sender: feePayerAddress,
      fee: ctx.txFee,
      memo: 'Deploy manager contract',
    },
    () => {
      AccountUpdate.fundNewAccount(feePayerAddress);

      manager.deploy({ zkappKey: managerKey });
    }
  );
  await ctx.submitTx(tx, {
    feePayerKey,
    logLabel: 'deploy manager contract',
  });
  console.log('tx done');

  let tx2 = await Mina.transaction(
    {
      sender: feePayerAddress,
      fee: ctx.txFee,
      memo: 'Deploy withdraw account',
    },
    () => {
      AccountUpdate.fundNewAccount(feePayerAddress);

      manager.deployAccount(withdrawAccountVerifyKey, userAddress);
    }
  );
  await ctx.submitTx(tx2, {
    feePayerKey,
    otherSignKeys: [userKey],
    logLabel: 'deploy withdraw account',
  });
  console.log('tx2 done');

  console.log('tx3 start');
  let tx3 = await Mina.transaction(
    {
      sender: feePayerAddress,
      fee: ctx.txFee,
      memo: 'test account',
    },
    () => {
      account.update(Field(109));
    }
  );
  await ctx.submitTx(tx3, {
    feePayerKey,
    logLabel: 'test account',
  });

  console.log('tx4 start');
  let tx4 = await Mina.transaction(
    {
      sender: feePayerAddress,
      fee: ctx.txFee,
      memo: 'manager update',
    },
    () => {
      manager.updateState(Field(669922), userAddress);
    }
  );
  await ctx.submitTx(tx4, {
    feePayerKey,
    logLabel: 'manager update',
  });

  // console.log('tx5 start 2');
  // // userKey = PrivateKey.fromBase58(
  // //   'EKEfZHFBSUpkXALmKM46bSAx44J22G7C7YGBzW8zQ56VQBfCPkVs'
  // // );
  // // userAddress = PublicKey.fromBase58(
  // //   'B62qq86EwQABBUiXLSNm3MwCgjx9YUm2XzWfcejbgWAuaYmdTYxsexT'
  // // );
  // let tx5 = await Mina.transaction(
  //   {
  //     sender: feePayerAddress,
  //     fee: ctx.txFee,
  //     memo: 'deploy test',
  //   },
  //   () => {
  //     AccountUpdate.fundNewAccount(feePayerAddress, 1);
  //     manager.deployAccount(withdrawAccountVerifyKey, userAddress);
  //     manager.updateState(Field(997), userAddress);
  //   }
  // );
  // await ctx.submitTx(tx5, {
  //   feePayerKey,
  //   otherSignKeys: [userKey],
  //   logLabel: 'deploy test',
  // });
}

await run();
