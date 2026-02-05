import { Module } from '@nestjs/common';
import { StateController } from './state.controller';
import { TickModule } from 'src/tick/tick.module';
import { StateService } from './state.service';

@Module({
    imports: [TickModule],
    controllers: [StateController],
    providers: [StateService],
    exports: [StateService],
})
export class StateModule {}
