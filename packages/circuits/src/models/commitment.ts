import { Field, PrivateKey } from 'o1js';

export interface Commitment {
  commitment(): Field;
}
