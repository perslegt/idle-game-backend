import { Injectable, NotFoundException } from '@nestjs/common';
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

            return {
                playerId: player.id,
                cityId: city.id,
            };
        });
    }
}
