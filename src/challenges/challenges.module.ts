import {Module} from '@nestjs/common';
import {ChallengesService} from './challenges.service';

@Module({
    providers: [ChallengesService],
    exports: [ChallengesService]
})
export class ChallengesModule {
}
