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

        const didGain =
            tick.gainedByResource.gold > 0 ||
            tick.gainedByResource.wood > 0 ||
            tick.gainedByResource.stone > 0 ||
            tick.gainedByResource.iron > 0 ||
            tick.gainedByResource.food > 0;
        
        const tickResult = didGain ? tick : null;

        return {
            ok: true,
            serverTime: new Date().toISOString(),
            playerId: player.id,
            cityId: player.city.id,
            tick: tickResult,
            state,
        };
    }
}