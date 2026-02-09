import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { TickService } from "src/tick/tick.service";

@Injectable()
export class StateService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tickService: TickService,
    ) {}

    async getState(cityId?: string) {
        if (!cityId) throw new BadRequestException('City ID is required');

        const city = await this.prisma.city.findUnique({
            where: { id: cityId },
            select: { id: true },
        });

        if (!city) throw new BadRequestException('City not found');

        const tick = await this.tickService.tickCity(city.id);

        const state = await this.prisma.city.findUnique({
            where: { id: city.id },
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
            cityId: city.id,
            tick: tickResult,
            state,
        };
    }
}