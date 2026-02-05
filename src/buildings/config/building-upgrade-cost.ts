import { ResourceType } from '@prisma/client';

export const BUILDING_UPGRADE_COST: Record<
  string,
  Record<number, Partial<Record<ResourceType, number>>>
> = {
  farm: {
    1: { wood: 100, stone: 50, iron: 30, food: 5, gold: 20 },
  },
  lumber_mill: {
    1: { wood: 80, stone: 40, iron: 25, food: 10, gold: 10 },
  },
  quarry: {
    1: { wood: 80, stone: 40, iron: 15, food: 10, gold: 10 },
  },
  iron_mine: {
    1: { wood: 120, stone: 60, iron: 10, food: 15, gold: 15 },
  },
  gold_mine: {
    1: { wood: 150, stone: 75, iron: 35, food: 20, gold: 35 },
  },
};
