import { IsUUID } from "class-validator";

export class StartPvpBattleDto {
    @IsUUID('4')
    attackerCityId: string;

    @IsUUID('4')
    defenderCityId: string;
}