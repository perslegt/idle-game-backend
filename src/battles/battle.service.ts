import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { resolveBattleV0_1, Army, TroopCategory } from './resolvers/resolver-v0_1';
import { Prisma } from '@prisma/client';

@Injectable()
export class BattleService {
    constructor(private readonly prisma: PrismaService) {}

    async resolvePvp(attackerCityId: string, defenderCityId: string) {
        if (attackerCityId === defenderCityId) {
            throw new BadRequestException('attackerCityId and defenderCityId must be different');
        }

        return this.prisma.$transaction(async (tx) => {
            const [a, d] = [attackerCityId, defenderCityId].sort();

            await tx.$executeRaw`
                SELECT id
                FROM "cities"
                WHERE id IN (${a}, ${d})
                FOR UPDATE
            `;

            const attackerArmy = await this.getArmyTx(tx, attackerCityId);
            const defenderArmy = await this.getArmyTx(tx, defenderCityId);

            const result = resolveBattleV0_1(attackerArmy, defenderArmy);

            await this.applyRemainingTroopsTx(tx, attackerCityId, result.attackerRemaining);
            await this.applyRemainingTroopsTx(tx, defenderCityId, result.defenderRemaining);

            const attackerCity = await tx.city.findUnique({
                where: { id: attackerCityId },
                select: { 
                    playerId: true,
                    player: {
                        select: { worldId: true}
                    }
                },
            });
            const defenderCity = await tx.city.findUnique({
                where: { id: defenderCityId },
                select: { playerId: true, }
            });
            if (!attackerCity || !defenderCity) {
                throw new NotFoundException('Attacker or defender city not found');
            }

            await tx.pvpBattle.create({
                data: {
                    worldId: attackerCity.player.worldId,
                    attackerId: attackerCity.playerId,
                    defenderId: defenderCity.playerId,

                    resolverVersion: 'v0.1',
                    attackPower: BigInt(0),  // vullen we later
                    defensePower: BigInt(0), // vullen we later
                    result: result.winner === 'attacker' ? 'attacker_win' : 'defender_win',

                    troopsSent: {}, // later
                    attackerLosses: result.attackerLosses,
                    defenderLosses: result.defenderLosses,

                    lootPotential: {}, // later
                    lootActual: {},    // later
                    carryCapacity: 0,  // later

                    resourcesBefore: {}, // later
                    resourcesAfter: {},  // later
                },
            });

            return {
                ok: true,
                attackerCityId,
                defenderCityId,
                winner: result.winner,
                note: 'Issue #7: resolverV0_1 applied with DB writes',
            };
        });
    }

    private async getArmyTx(tx: Prisma.TransactionClient, cityId: string): Promise<Army> {
        const stacks = await tx.cityTroopStack.findMany({
            where: { cityId },
            select: {
                level: true,
                quantity: true,
                troopType: {
                    select: {
                        category: {
                            select: {
                                code: true,
                            },
                        },
                        levels: {
                            select: {
                                level: true,
                                attack: true,
                                defense: true,
                            },
                        },
                    },
                },
            },
        });
        const army: Army = {
            infantry: { quantity: 0, attack: 0, defense: 0 },
            archers: { quantity: 0, attack: 0, defense: 0 },
            cavalry: { quantity: 0, attack: 0, defense: 0 },
        };

        for (const s of stacks) {
            const cat = s.troopType.category.code as keyof Army;

            const lvl = s.troopType.levels.find((l) => l.level === s.level);
            if (!lvl) throw new NotFoundException(`Missing troop stats for ${cat} level ${s.level}`);

            army[cat] = {
                quantity: s.quantity,
                attack: lvl.attack,
                defense: lvl.defense,
            };
        }

        return army;
    }

    private async applyRemainingTroopsTx(tx: Prisma.TransactionClient, cityId: string, remaining: Record<TroopCategory, number>) {
        await tx.cityTroopStack.updateMany({
            where: {
                cityId,
                troopType: {
                    category: {
                        code: 'infantry',
                    },
                },
            },
            data: { quantity: remaining.infantry },
        });
        await tx.cityTroopStack.updateMany({
            where: {
                cityId,
                troopType: {
                    category: {
                        code: 'archers',
                    },
                },
            },
            data: { quantity: remaining.archers },
        });
        await tx.cityTroopStack.updateMany({
            where: {
                cityId,
                troopType: {
                    category: {
                        code: 'cavalry',
                    },
                },
            },
            data: { quantity: remaining.cavalry },
        });
    }
}
