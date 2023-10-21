import { Bool, Experimental, Field } from 'o1js';
import { greaterThanFor254BitField } from '../src';

function printBits(bits: Bool[], label: string) {
  let str = '';
  bits.forEach((bit) => {
    str += bit.toBoolean() ? '1' : '0';
  });
  console.log(label + ': ', str);
}

let prover = Experimental.ZkProgram({
  publicOutput: Field,

  methods: {
    prove: {
      privateInputs: [Field, Field],
      method(a: Field, b: Field) {
        greaterThanFor254BitField(a, b).assertTrue('a > b');
        return Field(1);
      },
    },
  },
});

async function main() {
  console.log('start main');
  console.time('compile');
  await prover.compile();
  console.timeEnd('compile');
  console.log('compile success');

  console.log('run zkProgram');
  const a = Field(
    '24826761561340749540405248990704687072759409048575834593828520778697620216337'
  );

  const b = Field(
    '12762135127876208785654756334482501197156915425313803431609397567607989124934'
  );
  // const a = Field('999');
  // printBits(a.toBits(), 'a');
  // const b = Field('999');
  // printBits(b.toBits(), 'b');
  let proof = await prover.prove(a, b);
  console.log('prove success');
}

await main();
