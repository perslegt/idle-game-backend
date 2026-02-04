import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class TickService {
    constructor(private readonly prisma: PrismaService) {}

    async tickCity(cityId: string) {
        const city = await this.prisma.city.findUnique({
            where: { id: cityId },
            select: { lastTickAt: true },
        });

        if (!city) throw new Error('City not found');

        const now = new Date();

        const elapsedSeconds = Math.max(0, Math.floor((now.getTime() - city.lastTickAt.getTime()) / 1000));

        return { elapsedSeconds };
    }
}