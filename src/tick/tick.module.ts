import { Module } from "@nestjs/common";
import { TickService } from "./tick.service";
import { TickController } from "./tick.controller";

@Module({
    controllers: [TickController],
    providers: [TickService],
    exports: [TickService],
})
export class TickModule {}