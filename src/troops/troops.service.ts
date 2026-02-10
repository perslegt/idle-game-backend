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

    async trainAndReturnState(cityId: string, troopCode: string, level: number, quantity: number) {
        await this.train(cityId, troopCode, level, quantity);
        return this.stateService.getState(cityId, { skipTick: true });
    }

    async train(cityId: string, troopCode: string, level: number, quantity: number) {
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

            if (!Number.isInteger(level) || level < 1) {
                throw new BadRequestException('level must be an integer >= 1');
            }
            if (!Number.isInteger(quantity) || quantity < 1) {
                throw new BadRequestException('quantity must be an integer >= 1');
            }

            const baseCost = TROOP_TRAINING_COST[troopCode]?.[level];
            if (!baseCost) {
                throw new BadRequestException(`No training cost configured for ${troopCode} level ${level}`);
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
                    `Not enough resources to train ${quantity} ${troopCode} at level ${level}. Lacking: ${lacking
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

            await tx.cityTroopStack.upsert({
                where: {
                    cityId_troopTypeId_level: { cityId, troopTypeId: troopType.id, level },
                },
                update: { quantity: { increment: quantity } },
                create: { cityId, troopTypeId: troopType.id, level, quantity },
            });

        });
    }

    async getTrainingCostPreview(cityId: string, troopCode: string, level: number, quantity: number) {
        if (!Number.isInteger(quantity) || quantity < 1) {
            throw new BadRequestException('quantity must be an integer >= 1');
        }
        if (!Number.isInteger(level) || level < 1) {
            throw new BadRequestException('level must be an integer >= 1');
        }

        const city = await this.prisma.city.findUnique({
            where: { id: cityId },
            select: { id: true },
        });
        if (!city) throw new NotFoundException('City not found');

        const troopType = await this.prisma.troopType.findUnique({
            where: { code: troopCode },
            select: { id: true },
        });
        if (!troopType) throw new NotFoundException('Troop type not found');

        const baseCost = TROOP_TRAINING_COST[troopCode]?.[level];
        if (!baseCost) {
            throw new BadRequestException(`No training cost configured for ${troopCode} level ${level}`);
        }

        const cost = Object.fromEntries(
            Object.entries(baseCost).map(([k, v]) => [k, (v ?? 0) * quantity]),
        ) as Partial<Record<string, number>>;

        const resources = await this.prisma.cityResources.findUnique({
            where: { cityId },
            select: { wood: true, stone: true, iron: true, food: true, gold: true },
        });
        if (!resources) throw new NotFoundException('City resources not found');

        const canAfford = Object.entries(cost).every(([k, v]) => {
            const key = k as keyof typeof resources;
            return (resources[key] ?? 0) >= (v ?? 0);
        });

        const missing = Object.fromEntries(
            Object.entries(cost).map(([k, v]) => {
                const key = k as keyof typeof resources;
                const have = resources[key] ?? 0;
                const need = v ?? 0;
                return [k, Math.max(0, need - have)];
            }),
        );

        return {
            ok: true,
            cityId,
            troopCode,
            level,
            quantity,
            cost,
            canAfford,
            missing,
        };
    }

}