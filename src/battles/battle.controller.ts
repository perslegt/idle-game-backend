import { Body, Controller, Post } from "@nestjs/common";
import { StartPvpBattleDto } from "./dto/start-pvp-battle.dto";
import { BattleService } from "./battle.service";

@Controller('battles')
export class BattleController {
    constructor(private readonly battleService: BattleService) {}

    @Post('pvp/start')
    resolvePvpBattle(@Body() dto: StartPvpBattleDto) {
        return this.battleService.resolvePvp(dto.attackerCityId, dto.defenderCityId);
    }
}