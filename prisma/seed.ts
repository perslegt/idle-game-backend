import 'dotenv/config';
import { PrismaClient, ResourceType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  // 1) Default world
  const existingWorld = await prisma.world.findFirst({
    where: { code: 'default' },
  });

  const world =
    existingWorld ??
    (await prisma.world.create({
      data: { code: 'default' },
    }));

  // 2) Building types (config)
  // Kies codes die jij later overal gebruikt (upgrade costs, productie, UI labels).
  const buildingTypes = [
    { code: 'lumber_mill', productionResource: ResourceType.wood, baseRate: 10, growthMultiplier: 115 },
    { code: 'quarry', productionResource: ResourceType.stone, baseRate: 10, growthMultiplier: 115 },
    { code: 'iron_mine', productionResource: ResourceType.iron, baseRate: 100, growthMultiplier: 115 },
    { code: 'farm', productionResource: ResourceType.food, baseRate: 120, growthMultiplier: 112 },
    { code: 'gold_mine', productionResource: ResourceType.gold, baseRate: 10, growthMultiplier: 112 },
  ] as const;

  for (const bt of buildingTypes) {
    await prisma.buildingType.upsert({
      where: { code: bt.code },
      update: {
        productionResource: bt.productionResource,
        baseRate: bt.baseRate,
        growthMultiplier: bt.growthMultiplier,
      },
      create: {
        code: bt.code,
        productionResource: bt.productionResource,
        baseRate: bt.baseRate,
        growthMultiplier: bt.growthMultiplier,
      },
    });
  }

  // 3) Troop categories
  const infantry = await prisma.troopCategory.upsert({
    where: { code: 'infantry' },
    update: {},
    create: { code: 'infantry' },
  });

  const cavalry = await prisma.troopCategory.upsert({
    where: { code: 'cavalry' },
    update: {},
    create: { code: 'cavalry' },
  });

  const archers = await prisma.troopCategory.upsert({
    where: { code: 'archers' },
    update: {},
    create: { code: 'archers' },
  });



  // 3) Troop types
  const troopTypes = [
    {
      code: 'inf_infantry',
      categoryId: infantry.id,
    },
    {
      code: 'cav_cavalry',
      categoryId: cavalry.id,
    },
    {
      code: 'arc_archer',
      categoryId: archers.id,
    },
  ] as const;

  for (const tt of troopTypes) {
    await prisma.troopType.upsert({
      where: { code: tt.code },
      update: {},
      create: {
        code: tt.code,
        categoryId: tt.categoryId,
      },
    });

    const TROOP_LEVELS: Record<
      string,
      Array<{ level: number; attack: number; defense: number; carryCapacity: number }>
    > = {
      inf_infantry: [
        { level: 1, attack: 2, defense: 3, carryCapacity: 10 },
        { level: 2, attack: 3, defense: 4, carryCapacity: 12 },
      ],
      arc_archer: [
        { level: 1, attack: 3, defense: 1, carryCapacity: 8 },
        { level: 2, attack: 4, defense: 2, carryCapacity: 10 },
      ],
      cav_cavalry: [
        { level: 1, attack: 4, defense: 2, carryCapacity: 15 },
        { level: 2, attack: 5, defense: 3, carryCapacity: 18 },
      ],
    };

    const troopTypesWithId = await prisma.troopType.findMany({
      select: { id: true, code: true },
    });

    const troopTypeLevelsData = troopTypesWithId.flatMap((t) => {
      const levels = TROOP_LEVELS[t.code];
      if (!levels) {
        throw new Error(`Missing TROOP_LEVELS config for troopType code: ${t.code}`);
      }

      return levels.map((lvl) => ({
        troopTypeId: t.id,
        level: lvl.level,
        attack: lvl.attack,
        defense: lvl.defense,
        carryCapacity: lvl.carryCapacity,
      }));
    });

    await prisma.troopTypeLevel.createMany({
      data: troopTypeLevelsData,
      skipDuplicates: true,
    });
  }

  console.log(`Seed complete. World=${world.code}, buildingTypes=${buildingTypes.length}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
