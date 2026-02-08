import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { resolveBattleV0_1, Army } from './resolvers/resolver-v0_1';

@Injectable()
export class BattleService {
    constructor(private readonly prisma: PrismaService) {}

    async resolvePvp(attackerCityId: string, defenderCityId: string) {
        const [attackerArmy, defenderArmy] = await Promise.all([
        this.getArmy(attackerCityId),
        this.getArmy(defenderCityId),
        ]);

        const result = resolveBattleV0_1(attackerArmy, defenderArmy);

        return {
        ok: true,
        attackerCityId,
        defenderCityId,
        ...result,
        note: 'Issue #7: resolverV0_1 applied (no DB writes yet)',
        };
    }

    private async getArmy(cityId: string): Promise<Army> {
        const stacks = await this.prisma.cityTroopStack.findMany({
            where: { cityId },
            select: {
                level: true,
                quantity: true,
                troopType: {
                    select: {
                        category: { 
                            select: { 
                                code: true 
                            } 
                        },
                        levels: {
                            select: {
                                level: true,
                                attack: true, 
                                defense: true,
                            },
                            where: { 
                                level: { 
                                    equals: 1 
                                } 
                            },
                            take: 1,
                        },
                    },
                },
            },
        });


        if (stacks.length === 0) throw new NotFoundException('City troop stacks not found');

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
}
