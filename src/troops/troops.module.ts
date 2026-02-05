import { Module } from '@nestjs/common';
import { TroopsController } from './troops.controller';
import { TroopsService } from './troops.service';
import { TickModule } from 'src/tick/tick.module';
import { StateModule } from 'src/state/state.module';

@Module({
    imports: [TickModule, StateModule],
    controllers: [TroopsController],
    providers: [TroopsService],
})
export class TroopsModule {}
