import { Controller, ParseUUIDPipe, Param, Post, Body } from "@nestjs/common";
import { BuildingsService } from "./buildings.service";

@Controller('cities/:cityId/buildings')
export class BuildingsController {
    constructor(private readonly buildingsService: BuildingsService) {}

    @Post(':buildingCode/upgrade')
    upgradeBuilding(
        @Param('cityId', new ParseUUIDPipe({ version: '4' })) cityId: string,
        @Param('buildingCode') buildingCode: string,
    ) {
        return this.buildingsService.canUpgrade(cityId, buildingCode);
    }
}