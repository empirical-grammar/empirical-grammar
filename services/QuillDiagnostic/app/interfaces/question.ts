export interface Question {
    attempts?: Array<any>,
    blankAllowed?: boolean,
    caseInsensitive?: boolean,
    conceptID: string,
    cues: Array<string>,
    cuesLabel: string,
    flag?: string,
    instructions: string,
    itemLevel: string,
    key: string,
    prefilledText: string,
    prompt: string
}