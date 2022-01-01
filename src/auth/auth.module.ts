import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {ChallengesModule} from "../challenges/challenges.module";
import {UsersModule} from "../users/users.module";
import {JwtModule} from "@nestjs/jwt";
import {jwtConstants} from "./constants";
import {JwtStrategy} from "./jwt.strategy";
import {PassportModule} from "@nestjs/passport";

@Module({
    imports: [UsersModule, ChallengesModule, PassportModule,
            JwtModule.register({
            secret: jwtConstants.secret,
                signOptions: { expiresIn: '60s' },
        })],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService, JwtModule, JwtStrategy]
})
export class AuthModule {
}

