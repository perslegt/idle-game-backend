import { Module } from '@nestjs/common';
import { BuildingsController } from './buildings.controller';
import { BuildingsService } from './buildings.service';
import { TickModule } from 'src/tick/tick.module';

@Module({
    imports: [TickModule],
    controllers: [BuildingsController],
    providers: [BuildingsService],
})
export class BuildingsModule {}
