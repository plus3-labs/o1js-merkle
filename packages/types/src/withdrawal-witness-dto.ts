/**
 * for withdrawal
 */
export interface WithdrawalWitnessDto {
    withdrawNoteWitnessData: {
        withdrawNote: {
            secret: string,
            ownerPk: string,
            accountRequired: string,
            creatorPk: string,
            value: string,
            assetId: string,
            inputNullifier: string,
            noteType: string
        },
        witness: string[],
        index: string
    },
    lowLeafWitness: {
        leafData: {
            value: string,
            nextValue: string,
            nextIndex: string
        },
        siblingPath: string[],
        index: string
    },
    oldNullWitness: string[],
    rollupDataRoot: string
}
