import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class BuildingsService {
    constructor(private readonly prisma: PrismaService) {}

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

        return {
            ok: true,
            cityId,
            buildingCode,
            currentLevel: cityBuilding.level,
        }
    }
}