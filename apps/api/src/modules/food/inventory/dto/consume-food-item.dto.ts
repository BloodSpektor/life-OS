import { IsNumber, IsString, Min } from "class-validator";

export class ConsumeFoodItemDto {
    @IsNumber()
    @Min(0)
    amount: number;

    @IsString()
    unit: string;
}
