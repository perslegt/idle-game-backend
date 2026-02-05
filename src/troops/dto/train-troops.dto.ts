import { IsInt, Min } from "class-validator";

export class TrainTroopsDto {
    @IsInt()
    @Min(1)
    quantity!: number;
}