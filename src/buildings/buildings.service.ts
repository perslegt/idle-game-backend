import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { TickService } from "src/tick/tick.service";
import { BUILDING_UPGRADE_COST } from "./config/building-upgrade-cost";

@Injectable()
export class BuildingsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tickService: TickService,
    ) {}

    async upgrade(cityId: string, buildingCode: string) {
        return this.prisma.$transaction(async (tx) => {
            const row = await tx.$queryRaw<{ id: string }[]>`
                SELECT id
                FROM "cities"
                WHERE id = ${cityId}
                FOR UPDATE
            `;
            if (row.length === 0) throw new NotFoundException(`City with id ${cityId} not found`);

            await this.tickService.tickCity(cityId, tx);

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

            const nextLevel = cityBuilding.level + 1;
            const cost = BUILDING_UPGRADE_COST[buildingCode]?.[nextLevel];
            if (!cost) throw new BadRequestException(`No upgrade cost configured for ${buildingCode} level ${nextLevel}`);

            const resources = await this.prisma.cityResources.findUnique({
                where: { cityId },
                select: { wood: true, stone: true, iron: true, food: true, gold: true },
            });
            if (!resources) throw new NotFoundException(`City resources with cityId ${cityId} not found`);

            const lacking = Object.entries(cost).every(([resource, amount]) => {
                const key = resource as keyof typeof resources;
                return (resources[key] ?? 0) < (amount ?? 0);
            });
            if (lacking) throw new ConflictException(`Not enough resources to upgrade ${buildingCode} to level ${nextLevel}`);

            const updatedResourcces = await tx.cityResources.update({
                where: { cityId },
                data: {
                    wood: { decrement: cost.wood ?? 0 },
                    stone: { decrement: cost.stone ?? 0 },
                    iron: { decrement: cost.iron ?? 0 },
                    food: { decrement: cost.food ?? 0 },
                    gold: { decrement: cost.gold ?? 0 },
                },
                select: { wood: true, stone: true, iron: true, food: true, gold: true },
            });

            const updatedBuilding = await tx.cityBuilding.update({
                where: {
                    cityId_buildingTypeId: {
                        cityId,
                        buildingTypeId: buildingType.id,
                    },
                },
                data: { level: nextLevel },
                select: { level: true },
            });

            return {
                ok: true,
                cityId,
                buildingCode,
                newLevel: updatedBuilding.level,
                resources: updatedResourcces,
            }
        });
    }
}