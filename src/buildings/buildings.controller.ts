import { Controller, ParseUUIDPipe, Param, Post, Body, Query } from "@nestjs/common";
import { BuildingsService } from "./buildings.service";

@Controller('cities/:cityId/buildings')
export class BuildingsController {
    constructor(private readonly buildingsService: BuildingsService) {}

    @Post(':buildingCode/upgrade')
    upgradeBuilding(
        @Param('cityId', new ParseUUIDPipe({ version: '4' })) cityId: string,
        @Param('buildingCode') buildingCode: string,
        @Query('playerId', new ParseUUIDPipe({ version: '4' })) playerId: string,
    ) {
        return this.buildingsService.upgradeAndReturnState(playerId, cityId, buildingCode);
    }
}