import {Injectable} from '@nestjs/common';
import {Challenge} from "./challenges.model";

@Injectable()
export class ChallengesService {

    private readonly challenges: Array<Challenge> = [];

    async findById(id: string): Promise<Challenge | undefined> {
        return this.challenges.find(challenge => challenge.id === id);
    }

    save(challenge: Challenge) {
        return this.challenges.push(challenge);
    }

    async findAll(): Promise<Array<Challenge>> {
        return this.challenges;
    }
}
