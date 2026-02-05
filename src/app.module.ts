import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlayersModule } from './players/players.module';
import { PrismaModule } from './prisma/prisma.module';
import { TickModule } from './tick/tick.module';
import { StateModule } from './state/state.module';
import { BuildingsModule } from './buildings/buildings.module';
import { TroopsModule } from './troops/troop.module';

@Module({
  imports: [
    PlayersModule,
    PrismaModule, 
    TickModule,
    StateModule,
    BuildingsModule,
    TroopsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
