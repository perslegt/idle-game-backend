import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlayersModule } from './players/players.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PlayersModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
