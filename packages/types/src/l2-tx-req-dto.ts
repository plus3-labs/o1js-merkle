import { EncryptedNote } from "./encrypted-note";

/**
 * used for All L2 tx scenarios
 */
export interface L2TxReqDto {
    /**
     * from execution result of Join-Split circuit
     */
    proof: {
        publicInput: string[];
        publicOutput: string[];
        maxProofsVerified: 0 | 1 | 2;
        proof: string;
    }
    extraData: {
        outputNote1?: EncryptedNote,
        outputNote2?: EncryptedNote,

        /**
         * used at Account Registration section
         */
        acctPk?: string,

        /**
         * used at Account Registration section
         */
        aliasHash?: string,

        /**
         * encrypted alias
         */
        aliasInfo?: string,

        /**
         * used at Withdrawal section
         */
        withdrawNote?: {
            secret: string,
            ownerPk: string,
            accountRequired: string,
            creatorPk: string,
            value: string,
            assetId: string,
            inputNullifier: string,
            noteType: string,
        }
    }
}
