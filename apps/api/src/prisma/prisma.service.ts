import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super({
            log: ["query", "info", "warn", "error"],
        });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}

// Explicitly expose Prisma models for TypeScript
export type PrismaServiceType = PrismaService & {
    user: PrismaClient["user"];
    foodItem: PrismaClient["foodItem"];
    mealPlan: PrismaClient["mealPlan"];
};
