import { Field, Poseidon } from 'o1js';

export type { Hasher };
export { PoseidonHasher };

type Hasher = (v: Field[]) => Field;


const PoseidonHasher = (v: Field[]) => Poseidon.hash(v);