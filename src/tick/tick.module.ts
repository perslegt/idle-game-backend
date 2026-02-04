import { Module } from "@nestjs/common";
import { TickService } from "./tick.service";

@Module({
    providers: [TickService],
    exports: [TickService],
})
export class TickModule {}