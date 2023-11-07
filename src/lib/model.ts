import { Field } from 'o1js';

export type { Hasher };

type Hasher = (v: Field[]) => Field;
