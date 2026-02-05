import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { TickService } from "src/tick/tick.service";
import { BUILDING_UPGRADE_COST } from "./config/building-upgrade-cost";

@Injectable()
export class BuildingsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tickService: TickService,
    ) {}

    async canUpgrade(cityId: string, buildingCode: string) {
        const city = await this.prisma.city.findUnique({
            where: { id: cityId },
            select: { id: true },
        });
        if (!city) throw new NotFoundException(`City with id ${cityId} not found`);

        const buildingType = await this.prisma.buildingType.findUnique({
            where: { code: buildingCode },
            select: { id: true, code: true },
        });
        if (!buildingType) throw new NotFoundException(`Building type with code ${buildingCode} not found`);
        
        const cityBuilding = await this.prisma.cityBuilding.findUnique({
            where: {
                cityId_buildingTypeId: {
                    cityId,
                    buildingTypeId: buildingType.id,
                },
            },
            select: { level: true },
        });
        if (!cityBuilding) throw new NotFoundException(`City building with cityId ${cityId} and buildingTypeCode ${buildingCode} not found`);

        const tick = await this.tickService.tickCity(cityId);

        const nextLevel = cityBuilding.level + 1;
        const cost = BUILDING_UPGRADE_COST[buildingCode]?.[nextLevel];
        if (!cost) throw new BadRequestException(`No upgrade cost configured for ${buildingCode} level ${nextLevel}`);

        const resources = await this.prisma.cityResources.findUnique({
            where: { cityId },
            select: { wood: true, stone: true, iron: true, food: true, gold: true },
        });
        if (!resources) throw new NotFoundException(`City resources with cityId ${cityId} not found`);

        const canAfford = Object.entries(cost).every(([resource, amount]) => {
            const key = resource as keyof typeof resources;
            return (resources[key] ?? 0) >= (amount ?? 0);
        });

        return {
            ok: true,
            cityId,
            buildingCode,
            currentLevel: cityBuilding.level,
            nextLevel,
            tick: tick,
            cost,
            canAfford,
            resources,
        }
    }
}