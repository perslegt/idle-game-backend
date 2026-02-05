import { ResourceType } from '@prisma/client';

export const TROOP_TRAINING_COST: Record<
    string,
    Record<number, Partial<Record<ResourceType, number>>>
> = {
    inf_infantry: {
        1: { food: 50, wood: 20 },
        2: { food: 80, wood: 35 },
    },
    arc_archer: {
        1: { food: 40, wood: 30 },
        2: { food: 65, wood: 50 },
    },
    cav_cavalry: {
        1: { food: 80, wood: 40 },
        2: { food: 120, wood: 70 },
    },
};
