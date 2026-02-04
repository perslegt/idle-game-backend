import { Controller, Post, Param } from "@nestjs/common";
import { TickService } from "./tick.service";

@Controller('tick')
export class TickController {
    constructor(private readonly tickService: TickService) {}

    @Post(':cityId')
    tick(@Param('cityId') cityId: string) {
        return this.tickService.tickCity(cityId);
    }
}