export interface Challenge {
    id: string;
    userId: number;
    phonenumber: string;
    channel: string;
    ts: Date;
}

export interface HasChallengeId {
    challengeId: string;
}
