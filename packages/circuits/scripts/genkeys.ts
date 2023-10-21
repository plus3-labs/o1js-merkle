import { PrivateKey } from 'o1js';

const priKey = PrivateKey.random();
const pubKey = priKey.toPublicKey();

console.log('priKey: ', priKey.toBase58());
console.log('pubKey: ', pubKey.toBase58());
