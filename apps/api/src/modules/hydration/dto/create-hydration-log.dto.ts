import { IsNumber, Min } from "class-validator";

export class CreateHydrationLogDto {
    @IsNumber()
    @Min(1)
    amount: number;
}
