import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Query } from "@nestjs/common";
import { MealLogService } from "./meal-log.service";
import { CreateMealLogDto } from "./dto/create-meal-log.dto";
import { UpdateMealLogDto } from "./dto/update-meal-log.dto";

@Controller("meal-logs")
export class MealLogController {
    constructor(private readonly mealLogService: MealLogService) {}

    @Post()
    create(@Request() req, @Body() createMealLogDto: CreateMealLogDto) {
        const userId = req.user?.id || "default-user";
        return this.mealLogService.create(userId, createMealLogDto);
    }

    @Get()
    findAll(@Request() req, @Query("date") date?: string) {
        const userId = req.user?.id || "default-user";
        return this.mealLogService.findAll(userId, date);
    }

    @Get("stats/daily")
    getDailyStats(@Request() req, @Query("date") date?: string) {
        const userId = req.user?.id || "default-user";
        return this.mealLogService.getDailyStats(userId, date);
    }

    @Get("stats/weekly")
    getWeeklyStats(@Request() req) {
        const userId = req.user?.id || "default-user";
        return this.mealLogService.getWeeklyStats(userId);
    }

    @Get(":id")
    findOne(@Request() req, @Param("id") id: string) {
        const userId = req.user?.id || "default-user";
        return this.mealLogService.findOne(id, userId);
    }

    @Patch(":id")
    update(@Request() req, @Param("id") id: string, @Body() updateMealLogDto: UpdateMealLogDto) {
        const userId = req.user?.id || "default-user";
        return this.mealLogService.update(id, userId, updateMealLogDto);
    }

    @Delete(":id")
    remove(@Request() req, @Param("id") id: string) {
        const userId = req.user?.id || "default-user";
        return this.mealLogService.remove(id, userId);
    }
}
