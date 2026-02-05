import { Module } from '@nestjs/common';
import { BuildingsController } from './buildings.controller';
import { BuildingsService } from './buildings.service';
import { TickModule } from 'src/tick/tick.module';
import { StateModule } from 'src/state/state.module';

@Module({
    imports: [TickModule, StateModule],
    controllers: [BuildingsController],
    providers: [BuildingsService],
})
export class BuildingsModule {}
