import { Body, Controller, ParseUUIDPipe, Param, Post, Get, Query, ParseIntPipe } from "@nestjs/common";
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
    ) {
        return this.troopsService.trainAndReturnState(cityId, troopType, body.quantity);
    }

    @Get(':troopType/train/preview')
    getTrainingCostPreview(
        @Param('cityId', new ParseUUIDPipe({ version: '4' })) cityId: string,
        @Param('troopType') troopType: string,
        @Query('quantity', ParseIntPipe) quantity: number,
    ) {
        return this.troopsService.getTrainingCostPreview(cityId, troopType, quantity);
    }
}