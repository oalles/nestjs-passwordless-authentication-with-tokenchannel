import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AuthModule} from './auth/auth.module';
import {UsersModule} from './users/users.module';
import {ChallengesModule} from './challenges/challenges.module';
import {AuthService} from "./auth/auth.service";

@Module({
    imports: [AuthModule, UsersModule, ChallengesModule],
    controllers: [AppController],
    providers: [AuthService]
})
export class AppModule {
}
