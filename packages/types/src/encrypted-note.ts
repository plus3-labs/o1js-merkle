
export interface EncryptedNote {
    noteCommitment: string;
    /**
     * Base58
     */
    publicKey: string;
    /**
     * long text. from encrypt(valueNote.json())
     */
    cipherText: string;
    receiverInfo: string[];
}

