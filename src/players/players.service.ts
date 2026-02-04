import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PlayersService {
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreatePlayerDto) {
        return this.prisma.$transaction(async (tx) => {
            const world = await this.prisma.world.findUnique({
                where: { id: dto.worldId },
            });
            if (!world) {
                throw new NotFoundException('World not found');
            }

            const username = dto.username.trim();
            const cityName = (dto.cityName?.trim() || `${username}'s City`);

            const player = await tx.player.create({
                data: {
                    worldId: dto.worldId, username
                },
            });

            const city = await tx.city.create({
                data: {
                    playerId: player.id,
                    name: cityName,
                },
            });

            await tx.cityResources.create({
                data: {
                    cityId: city.id
                },
            });

            const buildingTypes = await tx.buildingType.findMany({
                select: { id: true },
            });

            if (buildingTypes.length === 0) {
                throw new InternalServerErrorException('No building types seeded');
            }

            await tx.cityBuilding.createMany({
                data: buildingTypes.map(bt => ({
                    cityId: city.id,
                    buildingTypeId: bt.id,
                    level: 0,
                })),
            });

            const troopTypes = await tx.troopType.findMany({
                select: { id: true },
            });

            if (troopTypes.length === 0) {
                throw new InternalServerErrorException('No troop types seeded');
            }

            await tx.cityTroopStack.createMany({
                data: troopTypes.map(tt => ({
                    cityId: city.id,
                    troopTypeId: tt.id,
                    level: 1,
                    quantity: 0,
                })),
            });

            return {
                playerId: player.id,
                cityId: city.id,
            };
        });
    }
}
