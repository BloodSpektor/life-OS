import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateHydrationLogDto } from "./dto/create-hydration-log.dto";

export interface HydrationLog {
    id: string;
    amount: number;
    date: Date;
    userId: string;
}

@Injectable()
export class HydrationService {
    private logs: HydrationLog[] = [];

    async create(dto: CreateHydrationLogDto, userId: string): Promise<HydrationLog> {
        const log: HydrationLog = {
            id: Date.now().toString(),
            amount: dto.amount,
            date: new Date(),
            userId,
        };

        this.logs.push(log);
        return log;
    }

    async findByUser(userId: string, date?: string): Promise<HydrationLog[]> {
        let userLogs = this.logs.filter((log) => log.userId === userId);

        if (date) {
            const targetDate = new Date(date);
            userLogs = userLogs.filter((log) => {
                const logDate = new Date(log.date);
                return logDate.toDateString() === targetDate.toDateString();
            });
        }

        return userLogs;
    }

    async getDailyStats(userId: string) {
        const today = new Date();
        const todayLogs = this.logs.filter((log) => {
            const logDate = new Date(log.date);
            return log.userId === userId && logDate.toDateString() === today.toDateString();
        });

        return {
            total: todayLogs.reduce((sum, log) => sum + log.amount, 0),
            count: todayLogs.length,
            logs: todayLogs,
        };
    }

    async delete(id: string, userId: string): Promise<void> {
        const index = this.logs.findIndex((log) => log.id === id && log.userId === userId);

        if (index === -1) {
            throw new NotFoundException("Hydration log not found");
        }

        this.logs.splice(index, 1);
    }
}
