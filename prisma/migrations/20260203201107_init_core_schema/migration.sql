-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('gold', 'wood', 'stone', 'iron', 'food');

-- CreateEnum
CREATE TYPE "BattleResult" AS ENUM ('attacker_win', 'defender_win');

-- CreateTable
CREATE TABLE "worlds" (
    "id" UUID NOT NULL,
    "code" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worlds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" UUID NOT NULL,
    "worldId" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" UUID NOT NULL,
    "playerId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "lastTickAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city_resources" (
    "cityId" UUID NOT NULL,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "wood" INTEGER NOT NULL DEFAULT 0,
    "stone" INTEGER NOT NULL DEFAULT 0,
    "iron" INTEGER NOT NULL DEFAULT 0,
    "food" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "city_resources_pkey" PRIMARY KEY ("cityId")
);

-- CreateTable
CREATE TABLE "troop_categories" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "troop_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "troop_types" (
    "id" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "troop_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "troop_type_levels" (
    "troopTypeId" UUID NOT NULL,
    "level" INTEGER NOT NULL,
    "attack" INTEGER NOT NULL,
    "defense" INTEGER NOT NULL,
    "carry_capacity" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "troop_type_levels_pkey" PRIMARY KEY ("troopTypeId","level")
);

-- CreateTable
CREATE TABLE "city_troop_stacks" (
    "cityId" UUID NOT NULL,
    "troopTypeId" UUID NOT NULL,
    "level" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "city_troop_stacks_pkey" PRIMARY KEY ("cityId","troopTypeId","level")
);

-- CreateTable
CREATE TABLE "building_types" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "productionResource" "ResourceType",
    "baseRate" INTEGER NOT NULL,
    "growthMultiplier" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "building_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city_buildings" (
    "cityId" UUID NOT NULL,
    "buildingTypeId" UUID NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "city_buildings_pkey" PRIMARY KEY ("cityId","buildingTypeId")
);

-- CreateTable
CREATE TABLE "pvp_battles" (
    "id" UUID NOT NULL,
    "worldId" UUID NOT NULL,
    "occurredAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attackerId" UUID NOT NULL,
    "defenderId" UUID NOT NULL,
    "resolverVersion" TEXT NOT NULL,
    "attackPower" BIGINT NOT NULL,
    "defensePower" BIGINT NOT NULL,
    "result" "BattleResult" NOT NULL,
    "troopsSent" JSONB NOT NULL,
    "attackerLosses" JSONB NOT NULL,
    "defenderLosses" JSONB NOT NULL,
    "lootPotential" JSONB NOT NULL,
    "lootActual" JSONB NOT NULL,
    "carryCapacity" INTEGER NOT NULL,
    "resourcesBefore" JSONB NOT NULL,
    "resourcesAfter" JSONB NOT NULL,

    CONSTRAINT "pvp_battles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_players__world_id" ON "players"("worldId");

-- CreateIndex
CREATE UNIQUE INDEX "players_worldId_username_key" ON "players"("worldId", "username");

-- CreateIndex
CREATE UNIQUE INDEX "cities_playerId_key" ON "cities"("playerId");

-- CreateIndex
CREATE INDEX "ix_cities__player_id" ON "cities"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "troop_categories_code_key" ON "troop_categories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "troop_types_code_key" ON "troop_types"("code");

-- CreateIndex
CREATE INDEX "ix_troop_types__category_id" ON "troop_types"("categoryId");

-- CreateIndex
CREATE INDEX "ix_city_troop_stacks__troop_type_id" ON "city_troop_stacks"("troopTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "building_types_code_key" ON "building_types"("code");

-- CreateIndex
CREATE INDEX "ix_city_buildings__building_type_id" ON "city_buildings"("buildingTypeId");

-- CreateIndex
CREATE INDEX "ix_pvp_battles__world_id" ON "pvp_battles"("worldId");

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "worlds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_resources" ADD CONSTRAINT "city_resources_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "troop_types" ADD CONSTRAINT "troop_types_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "troop_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "troop_type_levels" ADD CONSTRAINT "troop_type_levels_troopTypeId_fkey" FOREIGN KEY ("troopTypeId") REFERENCES "troop_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_troop_stacks" ADD CONSTRAINT "city_troop_stacks_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_troop_stacks" ADD CONSTRAINT "city_troop_stacks_troopTypeId_fkey" FOREIGN KEY ("troopTypeId") REFERENCES "troop_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_buildings" ADD CONSTRAINT "city_buildings_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_buildings" ADD CONSTRAINT "city_buildings_buildingTypeId_fkey" FOREIGN KEY ("buildingTypeId") REFERENCES "building_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pvp_battles" ADD CONSTRAINT "pvp_battles_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "worlds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pvp_battles" ADD CONSTRAINT "pvp_battles_attackerId_fkey" FOREIGN KEY ("attackerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pvp_battles" ADD CONSTRAINT "pvp_battles_defenderId_fkey" FOREIGN KEY ("defenderId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
