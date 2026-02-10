import { BUILDING_LEVEL_CONFIG } from '../config/building-level.config';

type BuildingRow = {
    level: number;
    buildingType: {
        code: string;
        productionResource: string | null;
    };
};

export function calculateRatesPerSecond(buildings: BuildingRow[]) {
    const rates: Record<string, number> = {
        wood: 0,
        stone: 0,
        iron: 0,
        food: 0,
        gold: 0,
    };

    for (const building of buildings) {
        const resource = building.buildingType.productionResource;
        if (!resource) continue;

        const code = building.buildingType.code;
        const level = building.level;

        const perHour = BUILDING_LEVEL_CONFIG[code]?.[level]?.productionPerHour ?? 0;
        if (perHour <= 0) continue;

        rates[resource] += perHour / 3600; // float toegestaan
    }

    return rates;
}
