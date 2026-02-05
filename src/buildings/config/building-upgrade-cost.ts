import { ResourceType } from '@prisma/client';

export const BUILDING_UPGRADE_COST: Record<
  string,
  Record<number, Partial<Record<ResourceType, number>>>
> = {
  farm: {
    1: { wood: 100, stone: 50, iron: 30, food: 5, gold: 20 },
    2: { wood: 150, stone: 75, iron: 50, food: 10, gold: 30 },
    3: { wood: 200, stone: 100, iron: 75, food: 15, gold: 50 },
    4: { wood: 300, stone: 150, iron: 100, food: 25, gold: 75 },
    5: { wood: 500, stone: 250, iron: 150, food: 40, gold: 100 },
  },
  lumber_mill: {
    1: { wood: 80, stone: 40, iron: 25, food: 10, gold: 10 },
    2: { wood: 120, stone: 60, iron: 40, food: 15, gold: 15 },
    3: { wood: 180, stone: 90, iron: 60, food: 20, gold: 25 },
    4: { wood: 250, stone: 125, iron: 80, food: 30, gold: 40 },
    5: { wood: 400, stone: 200, iron: 120, food: 50, gold: 60 },
  },
  quarry: {
    1: { wood: 80, stone: 40, iron: 15, food: 10, gold: 10 },
    2: { wood: 120, stone: 60, iron: 25, food: 15, gold: 15 },
    3: { wood: 180, stone: 90, iron: 40, food: 20, gold: 25 },
    4: { wood: 250, stone: 125, iron: 60, food: 30, gold: 40 },
    5: { wood: 400, stone: 200, iron: 90, food: 50, gold: 60 },
  },
  iron_mine: {
    1: { wood: 120, stone: 60, iron: 10, food: 15, gold: 15 },
    2: { wood: 180, stone: 90, iron: 20, food: 20, gold: 25 },
    3: { wood: 250, stone: 125, iron: 35, food: 30, gold: 40 },
    4: { wood: 350, stone: 175, iron: 50, food: 45, gold: 60 },
    5: { wood: 500, stone: 250, iron: 75, food: 70, gold: 80 },
  },
  gold_mine: {
    1: { wood: 150, stone: 75, iron: 35, food: 20, gold: 35 },
    2: { wood: 225, stone: 110, iron: 50, food: 30, gold: 50 },
    3: { wood: 325, stone: 160, iron: 75, food: 45, gold: 75 },
    4: { wood: 450, stone: 225, iron: 100, food: 65, gold: 100 },
    5: { wood: 600, stone: 300, iron: 150, food: 90, gold: 150 },
  },
};
