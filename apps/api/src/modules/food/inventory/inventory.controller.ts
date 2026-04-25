import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { CreateFoodItemDto } from "./dto/create-food-item.dto";
import { UpdateFoodItemDto } from "./dto/update-food-item.dto";
import { ConsumeFoodItemDto } from "./dto/consume-food-item.dto";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";

@Controller("inventory")
@UseGuards(JwtAuthGuard)
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) {}

    @Post()
    create(@Request() req, @Body() createFoodItemDto: CreateFoodItemDto) {
        return this.inventoryService.create(req.user.id, createFoodItemDto);
    }

    @Get()
    findAll(@Request() req) {
        return this.inventoryService.findAll(req.user.id);
    }

    @Get("categories")
    getCategories(@Request() req) {
        return this.inventoryService.getCategories(req.user.id);
    }

    @Get("stats")
    getStats(@Request() req) {
        return this.inventoryService.getStats(req.user.id);
    }

    @Get(":id")
    findOne(@Request() req, @Param("id") id: string) {
        return this.inventoryService.findOne(id, req.user.id);
    }

    @Patch(":id")
    update(@Request() req, @Param("id") id: string, @Body() updateFoodItemDto: UpdateFoodItemDto) {
        return this.inventoryService.update(id, req.user.id, updateFoodItemDto);
    }

    @Delete(":id")
    remove(@Request() req, @Param("id") id: string) {
        return this.inventoryService.remove(id, req.user.id);
    }

    @Post(":id/consume")
    consume(@Request() req, @Param("id") id: string, @Body() consumeFoodItemDto: ConsumeFoodItemDto) {
        return this.inventoryService.consume(id, req.user.id, consumeFoodItemDto);
    }
}
