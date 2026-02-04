import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { first } from "rxjs";
import { BUILDING_LEVEL_CONFIG } from "./config/building-level.config";

const MAX_ELAPSED_SECONDS = 8 * 60 * 60; // 8 hours

@Injectable()
export class TickService {
    constructor(private readonly prisma: PrismaService) {}

    async tickCity(cityId: string) {
        return this.prisma.$transaction(async (tx) => {
            const row = await tx.$queryRaw<{ lastTickAt: Date }[]>`
                SELECT "lastTickAt"
                FROM "cities"
                WHERE id = ${cityId}
                FOR UPDATE
            `;

            if (row.length === 0) throw new Error('City not found');

            const lastTickAt = row[0].lastTickAt;
            const now = new Date();

            const elapsedSecondsRaw = Math.floor(
                (now.getTime() - lastTickAt.getTime()) / 1000,
            );

            const elapsedSeconds = Math.max(0, Math.min(MAX_ELAPSED_SECONDS, elapsedSecondsRaw));

            const buildings = await tx.cityBuilding.findMany({
                where: { cityId },
                select: {
                    level: true,
                    buildingType: {
                        select: {
                            code: true,
                            productionResource: true,
                        },
                    },
                },
            });

            const gainedByResource: Record<string, number> = {
                wood: 0,
                stone: 0,
                iron: 0,
                food: 0,
                gold: 0,
            };

            for (const building of buildings) {
                if (!building.buildingType.productionResource) continue;

                const buildingCode = building.buildingType.code;
                const level = building.level;

                const ratePerHour = BUILDING_LEVEL_CONFIG[buildingCode]?.[level]?.productionPerHour ?? 0;

                if (ratePerHour <= 0) continue;

                const gained = Math.floor((ratePerHour * elapsedSeconds) / 3600);

                gainedByResource[building.buildingType.productionResource] += gained;
            }

            await tx.city.update({
                where: { id: cityId },
                data: { lastTickAt: now },
            });

            return {
                elapsedSeconds,
                gainedByResource,
            };
        });
    }
}