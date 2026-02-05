import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TickService } from 'src/tick/tick.service';
import { TROOP_TRAINING_COST } from './config/troop-training-cost.config';
import { BadRequestException } from '@nestjs/common/exceptions';
import { StateService } from 'src/state/state.service';

@Injectable()
export class TroopsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tickService: TickService,
        private readonly stateService: StateService,
    ) {}

    async trainAndReturnState(playerId: string, cityId: string, troopCode: string, quantity: number) {
        await this.train(cityId, troopCode, quantity);
        return this.stateService.getState(playerId);
    }

    async train(cityId: string, troopCode: string, quantity: number) {
        await this.prisma.$transaction(async (tx) => {
            const row = await tx.$queryRaw<{ id: string }[]>`
                SELECT id
                FROM "cities"
                WHERE id = ${cityId}
                FOR UPDATE
            `;
            if (row.length === 0) throw new NotFoundException(`City with id ${cityId} not found`);

            await this.tickService.tickCity(cityId, tx);

            const troopType = await tx.troopType.findUnique({
                where: { code: troopCode },
                select: { id: true },
            });
            if (!troopType) throw new NotFoundException(`Troop type with code ${troopCode} not found`);

            const stack = await tx.cityTroopStack.findFirst({
                where: {
                    cityId,
                    troopTypeId: troopType.id,
                },
                orderBy: { level: 'asc' },
                select: { level: true, quantity: true },
            });
            if (!stack) throw new NotFoundException(`City troop stack with cityId ${cityId} and troopTypeCode ${troopCode} not found`);
        
            const baseCost = TROOP_TRAINING_COST[troopCode]?.[stack.level];
            if (!baseCost) {
                throw new BadRequestException(`No training cost configured for ${troopCode} level ${stack.level}`);
            }

            const totalCost = Object.fromEntries(
                Object.entries(baseCost).map(([k, v]) => [k, (v ?? 0) * quantity]),
            ) as Partial<Record<keyof typeof baseCost, number>>;

            const resources = await tx.cityResources.findUnique({
                where: { cityId },
                select: { wood: true, stone: true, iron: true, food: true, gold: true },
            });
            if (!resources) throw new NotFoundException(`Resources for city with id ${cityId} not found`);

            const lacking = Object.entries(totalCost).filter(([k, v]) => {
                const key = k as keyof typeof resources;
                return (resources[key] ?? 0) < (v ?? 0);
            });

            if (lacking.length > 0) {
                throw new BadRequestException(
                    `Not enough resources to train ${quantity} ${troopCode} at level ${stack.level}. Lacking: ${lacking
                    .map(([k, v]) => `${k} (need ${v}, have ${resources[k as keyof typeof resources] ?? 0})`)
                    .join(', ')}`,
                );
            }

            await tx.cityResources.update({
                where: { cityId },
                data: {
                    wood: { decrement: totalCost.wood ?? 0 },
                    stone: { decrement: totalCost.stone ?? 0 },
                    iron: { decrement: totalCost.iron ?? 0 },
                    food: { decrement: totalCost.food ?? 0 },
                    gold: { decrement: totalCost.gold ?? 0 },
                },
            });

            await tx.cityTroopStack.updateMany({
                where: {
                    cityId,
                    troopTypeId: troopType.id,
                    level: stack.level,
                },
                data: { quantity: { increment: quantity } },
            });
        });
    }
}