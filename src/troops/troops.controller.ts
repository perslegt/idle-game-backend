import { Body, Controller, ParseUUIDPipe, Param, Post, Query } from "@nestjs/common";
import { TrainTroopsDto } from "./dto/train-troops.dto";
import { TroopsService } from "./troops.service";

@Controller('cities/:cityId/troops')
export class TroopsController {
    constructor(private readonly troopsService: TroopsService) {}

    @Post(':troopType/train')
    train(
        @Param('cityId', new ParseUUIDPipe({ version: '4' })) cityId: string,
        @Param('troopType') troopType: string,
        @Body() body: TrainTroopsDto,
        @Query('playerId', new ParseUUIDPipe({ version: '4' })) playerId: string,
    ) {
        return this.troopsService.train(cityId, troopType, body.quantity, playerId);
    }
}