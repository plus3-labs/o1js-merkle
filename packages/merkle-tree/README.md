# Merkle Tree based on o1js And LevelDB

The MerkleTree & MerkleMap implementation within o1js are only in memory (until the time when the doc is published here), which means all data would be lost if the process shutdowns. So we need a Merkle Tree with persistence ability.

Besides, the MerkleMap implementation within o1js only support Tree height of 256 (because of 'Field'), which means each merkle-witness verfication within circuit cost much!
Within this repo, the height of merkle tree for non-existence witness could be customized.

// TODO  
will add more feature intro here later...

NOTE: This Merkle Tree is carried out with great reference on [Aztec-packages](https://github.com/AztecProtocol/aztec-packages/tree/master/yarn-project/merkle-tree).

## How to build

```sh
npm run build
```

## How to run tests

```sh
npm run test
npm run testw # watch mode
```

## License

[Apache-2.0](LICENSE)
