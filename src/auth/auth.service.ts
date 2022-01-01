import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {UsersService} from "../users/users.service";
import {ChallengesService} from "../challenges/challenges.service";
import {
    BadRequestError,
    ChallengeExpiredError,
    Channel,
    Charset,
    IChallengeOptions,
    InvalidCodeError,
    InvalidIdentifierError,
    MaxAttemptsExceededError,
    TargetOptOutError,
    Tokenchannel
} from "tokenchannel";
import {Challenge, HasChallengeId} from "../challenges/challenges.model";
import {JwtService} from "@nestjs/jwt";
import {User} from "../users/users.model";

@Injectable()
export class AuthService {

    private tokenchannel: Tokenchannel;
    private challengeOptions: IChallengeOptions;
    private defaultChannel = Channel.VOICE;

    constructor(private usersService: UsersService,
                private challengesService: ChallengesService,
                private readonly jwtService: JwtService) {

        const apiKey = process.env.TOKENCHANNEL_API_KEY; // Config Service??
        if (!apiKey) {
            throw new Error("Missing TC api Key");
        }

        this.tokenchannel = new Tokenchannel(apiKey, true);
        this.challengeOptions = {
            language: "en",
            codeLength: 6,
            charset: Charset.UPPER,
            maxAttempts: 3
        };
    }

    /**
     * Authentication flow initiation
     * @param phonenumber
     */
    async initiate(phonenumber: string): Promise<HasChallengeId> {

        const user = await this.usersService.findByPhoneNumber(phonenumber);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        try {
            const {requestId} = await this.tokenchannel.challenge(this.defaultChannel, phonenumber,
                this.challengeOptions);

            // Audit Challenge
            const challenge: Challenge = {
                id: requestId,
                channel: this.defaultChannel,
                phonenumber: phonenumber,
                userId: user.id,
                ts: new Date()
            };
            this.challengesService.save(challenge);

            return {challengeId: requestId};
        } catch (error) {
            if (error instanceof TargetOptOutError) {
                throw new ForbiddenException('User opted out');
            } else if (error instanceof InvalidIdentifierError) {
                throw new BadRequestException('Invalid identifier');
            } else if (error instanceof BadRequestError) {
                throw new BadRequestException('Invalid channel, identifier or option value or target customer opted out verification by the given channel');
            } else {
                console.log("Error: ", JSON.stringify(error));
                throw new ForbiddenException(JSON.stringify(error));
            }
        }
    }

    /**
     * Challenge verification
     * @param challengeId
     * @param code
     */
    async verify(challengeId: string, code: string): Promise<User> {

        const challenge = await this.challengesService.findById(challengeId);
        if (!challenge) {
            throw new ForbiddenException('Invalid challenge id. Start new challenge');
        }
        try {

            const user = await this.usersService.findByPhoneNumber(challenge.phonenumber);
            if (!user) {
                throw new ForbiddenException('User not found from challenge. App inconsistency.');
            }

            await this.tokenchannel.authenticate(challengeId, code);

            // User - succesfully authenticated
            return user;
        } catch (error) {
            if (error instanceof InvalidCodeError) {
                throw new BadRequestException('Invalid code');
            } else if (error instanceof MaxAttemptsExceededError || error instanceof ChallengeExpiredError) {
                throw new NotFoundException('Two many attempts. Start again');
            } else {
                console.log("Error: ", JSON.stringify(error));
                throw error;
            }
        }
    }

    /**
     * JWT Credentials creation for authenticated user.
     * @param user
     */
    async createToken(user: User): Promise<any> {

        const payload = {username: user.name, sub: user.id};
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
