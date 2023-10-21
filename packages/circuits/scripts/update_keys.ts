import * as fs from 'fs';
import { PrivateKey } from 'o1js';

function updateKeys() {
  console.log('start change keys...');

  const keysConfigPath = './scripts/keys-private.json';
  let jsonBuf = fs.readFileSync(keysConfigPath);
  let currentKeysConfigStr = jsonBuf.toString();
  console.log({ currentKeysConfigStr });

  // first backup config
  const currentTime = new Date().getTime();
  const backupConfigPath = './scripts/keys_' + currentTime + '-private.json';
  console.log({ backupConfigPath });
  fs.writeFileSync(backupConfigPath, currentKeysConfigStr);

  // second change keys without fee payer and operator
  let config = JSON.parse(currentKeysConfigStr);
  // update vault contract keys
  let vaultPrivateKey = PrivateKey.random();
  let vaultPublicKey = vaultPrivateKey.toPublicKey();
  config.vaultContract.privateKey = vaultPrivateKey.toBase58();
  config.vaultContract.publicKey = vaultPublicKey.toBase58();

  // update entry contract keys
  let entryPrivateKey = PrivateKey.random();
  let entryPublicKey = entryPrivateKey.toPublicKey();
  config.entryContract.privateKey = entryPrivateKey.toBase58();
  config.entryContract.publicKey = entryPublicKey.toBase58();

  // update rollup contract keys
  let rollupPrivateKey = PrivateKey.random();
  let rollupPublicKey = rollupPrivateKey.toPublicKey();
  config.rollupContract.privateKey = rollupPrivateKey.toBase58();
  config.rollupContract.publicKey = rollupPublicKey.toBase58();

  console.log('new config: ', config);
  const newConfigStr = JSON.stringify(config);
  fs.writeFileSync(keysConfigPath, newConfigStr);

  console.log('change keys success');
}

updateKeys();
