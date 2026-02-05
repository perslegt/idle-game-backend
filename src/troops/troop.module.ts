import { Module } from '@nestjs/common';
import { TroopsController } from './troops.controller';

@Module({
    controllers: [TroopsController],
})
export class TroopsModule {}
