import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { TickService } from "src/tick/tick.service";

@Injectable()
export class StateService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tickService: TickService,
    ) {}

    async getState(playerId?: string) {
        if (!playerId) throw new BadRequestException('Player ID is required');

        const player = await this.prisma.player.findUnique({
            where: { id: playerId },
            select: {
                id: true,
                city: {
                    select: { id: true }
                },
            },
        });

        if (!player || !player.city) throw new BadRequestException('Player or city not found');

        const tick = await this.tickService.tickCity(player.city.id);

        const state = await this.prisma.city.findUnique({
            where: { id: player.city.id },
            select: {
                id: true,
                lastTickAt: true,
                resources: {
                    select: {
                        wood: true,
                        stone: true,
                        iron: true,
                        food: true,
                        gold: true,
                    },
                },
                buildings: {
                    select: {
                        level: true,
                        buildingType: {
                            select: {
                                code: true,
                                productionResource: true,
                            },
                        }, 
                    },
                    orderBy: [{ buildingType: { code: 'asc' } }],
                },
                troopsStack: {
                    select: {
                        level: true,
                        quantity: true,
                        troopType: {
                        select: {
                            code: true,
                            category: { select: { code: true } },
                        },
                        },
                    },
                    orderBy: [
                        { level: 'asc' },
                        { troopTypeId: 'asc' },
                    ],
                },
            },
        });

        const gained = (tick as any)?.gainedByResource ?? {};

        return {
            ok: true,
            serverTime: new Date().toISOString(),
            playerId: player.id,
            cityId: player.city.id,
            tick: {
                elapsedSeconds: tick.elapsedSeconds,
                gainedByResource: {
                gold: Number(gained.gold ?? 0),
                wood: Number(gained.wood ?? 0),
                stone: Number(gained.stone ?? 0),
                iron: Number(gained.iron ?? 0),
                food: Number(gained.food ?? 0),
                },
            },
            state,
        };
    }
}