import {BadRequestException, Controller, Get, Post, Request, UseGuards} from '@nestjs/common';
import {AuthService} from "./auth/auth.service";
import {User} from "./users/users.model";
import {UsersService} from "./users/users.service";
import {JwtAuthGuard} from "./auth/jwt-auth.guard";
import {ChallengesService} from "./challenges/challenges.service";

@Controller()
export class AppController {

    constructor(private readonly userService: UsersService, private readonly authService: AuthService,
                private readonly challengesService: ChallengesService) {
    }

    @Post('auth/init')
    async initAuth(@Request() req) {
        if (!req.body.phonenumber) {
            throw new BadRequestException('Invalid phonenumber');
        }
        return this.authService.initiate(req.body.phonenumber);
    }

    @Post('auth/verify')
    async verify(@Request() req) {
        if (!req.body.challengeId || !req.body.code) {
            throw new BadRequestException('Invalid payload. challengeId and code required.');
        }
        const user: User = await this.authService.verify(req.body.challengeId, req.body.code);
        return this.authService.createToken(user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('users')
    async getAllUsers() {
        return this.userService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('challenges')
    async getAllChallenges() {
        return this.challengesService.findAll();
    }
}
