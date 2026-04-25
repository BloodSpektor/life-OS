import { Controller, Get, Post, Delete, Body, Param, Query, Request, UseGuards } from "@nestjs/common";
import { HydrationService } from "./hydration.service";
import { CreateHydrationLogDto } from "./dto/create-hydration-log.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("hydration")
@UseGuards(JwtAuthGuard)
export class HydrationController {
    constructor(private readonly hydrationService: HydrationService) {}

    @Post()
    async create(@Body() dto: CreateHydrationLogDto, @Request() req: any) {
        return this.hydrationService.create(dto, req.user.userId);
    }

    @Get()
    async findAll(@Request() req: any, @Query("date") date?: string) {
        return this.hydrationService.findByUser(req.user.userId, date);
    }

    @Get("today")
    async getTodayStats(@Request() req: any) {
        return this.hydrationService.getDailyStats(req.user.userId);
    }

    @Delete(":id")
    async remove(@Param("id") id: string, @Request() req: any) {
        return this.hydrationService.delete(id, req.user.userId);
    }
}
