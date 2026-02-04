import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreatePlayerDto {
  @IsUUID()
  worldId: string;

  @IsString()
  @MinLength(3)
  @MaxLength(24)
  username: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  cityName?: string;
}