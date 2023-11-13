import { Field, Poseidon } from 'o1js';

export type { Hasher };
export { PoseidonHasherFunc };

type Hasher = (v: Field[]) => Field;


const PoseidonHasherFunc = (v: Field[]) => Poseidon.hash(v);