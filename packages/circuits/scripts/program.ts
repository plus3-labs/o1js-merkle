import { Experimental, Field, Struct, UInt64 } from 'o1js';

class TempStruct extends Struct({
  depositRoot: Field,
  currentIndex: Field,
  actionsHash: Field,
  amount: UInt64,
}) {}

let prover = Experimental.ZkProgram({
  publicOutput: TempStruct,

  methods: {
    prove: {
      privateInputs: [],
      method() {
        return new TempStruct({
          depositRoot: Field(1),
          currentIndex: Field(2),
          actionsHash: Field(3),
          amount: UInt64.from(4),
        });
      },
    },
  },
});

class TempProof extends Experimental.ZkProgram.Proof(prover) {}

async function main() {
  console.log('start main');
  await prover.compile();
  console.log('compile success');

  let proof = await prover.prove();
  console.log('prove success');

  let jsonProof = proof.toJSON();
  console.log('generate proof: ', jsonProof);

  let proof2 = TempProof.fromJSON(jsonProof);
  console.log('proof2: ', proof2.toJSON());

  let proof3 = TempProof.fromJSON(JSON.parse(JSON.stringify(jsonProof)));
  console.log('proof3: ', proof2.toJSON());
}

await main();
