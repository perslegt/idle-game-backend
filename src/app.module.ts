import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlayersModule } from './players/players.module';
import { PrismaModule } from './prisma/prisma.module';
import { TickModule } from './tick/tick.module';

@Module({
  imports: [PlayersModule, PrismaModule,  TickModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
