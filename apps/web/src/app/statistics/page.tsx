"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function StatisticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Статистика</h1>
        <p className="text-gray-500 mt-1">Анализируйте свои показатели</p>
      </div>

      {/* Empty State */}
      <Card>
        <CardContent className="py-24 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <BarChart3 className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">Страница в разработке</p>
              <p className="text-sm text-gray-500 mt-1">
                Функционал статистики будет доступен позже
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
