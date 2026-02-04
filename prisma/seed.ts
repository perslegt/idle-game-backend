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
