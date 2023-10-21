import { fetchAccount, PrivateKey, TokenId } from 'o1js';

async function main() {
  console.log('minaexplorer');
  let account = await fetchAccount(
    {
      publicKey: 'B62qrsUqxsy7f7EV6TmaKG8th2hEzhTdcNu5d2Wc8vKU2GiCQYqLSLz',
      tokenId: TokenId.fromBase58(
        'xeeB1Q7rMbGo77a2ypuM77cCQmQTBa3cz8XuS3w79wB6u58bGK'
      ),
    },
    'https://proxy.berkeley.minaexplorer.com'
  );

  console.log('account: ', JSON.stringify(account));
}

await main();
