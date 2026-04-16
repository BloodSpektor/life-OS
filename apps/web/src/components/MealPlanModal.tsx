"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface MealPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; scheduledTime: string; plannedCalories: number; days: string[] }) => void;
  initialData?: { id: string; name: string; scheduledTime: string; plannedCalories: number; days?: string[] };
}

const DAYS = [
  { value: "Пн", label: "Пн" },
  { value: "Вт", label: "Вт" },
  { value: "Ср", label: "Ср" },
  { value: "Чт", label: "Чт" },
  { value: "Пт", label: "Пт" },
  { value: "Сб", label: "Сб" },
  { value: "Вс", label: "Вс" },
];

export function MealPlanModal({ open, onOpenChange, onSubmit, initialData }: MealPlanModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [scheduledTime, setScheduledTime] = useState(initialData?.scheduledTime || "");
  const [plannedCalories, setPlannedCalories] = useState(initialData?.plannedCalories?.toString() || "");
  const [selectedDays, setSelectedDays] = useState<string[]>(initialData?.days || ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]);
  const [errors, setErrors] = useState<{ name?: string; scheduledTime?: string; plannedCalories?: string; days?: string }>({});

  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: typeof errors = {};
    
    if (!name.trim()) {
      newErrors.name = "Название обязательно";
    }
    
    if (!scheduledTime.trim()) {
      newErrors.scheduledTime = "Время обязательно";
    } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(scheduledTime)) {
      newErrors.scheduledTime = "Неверный формат времени (HH:MM)";
    }
    
    const calories = parseFloat(plannedCalories);
    if (!plannedCalories.trim() || isNaN(calories) || calories <= 0) {
      newErrors.plannedCalories = "Калории должны быть больше 0";
    }

    if (selectedDays.length === 0) {
      newErrors.days = "Выберите хотя бы один день";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit({
      name: name.trim(),
      scheduledTime: scheduledTime.trim(),
      plannedCalories: calories,
      days: selectedDays,
    });
    
    // Reset form
    setName("");
    setScheduledTime("");
    setPlannedCalories("");
    setSelectedDays(["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]);
    setErrors({});
  };

  const handleClose = () => {
    setName(initialData?.name || "");
    setScheduledTime(initialData?.scheduledTime || "");
    setPlannedCalories(initialData?.plannedCalories?.toString() || "");
    setSelectedDays(initialData?.days || ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]);
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Редактировать прием пищи" : "Добавить прием пищи"}</DialogTitle>
          <DialogDescription>
            Укажите название, время и планируемое количество калорий
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                placeholder="Например: Завтрак"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="time">Время</Label>
              <Input
                id="time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className={errors.scheduledTime ? "border-red-500" : ""}
              />
              {errors.scheduledTime && <p className="text-sm text-red-500">{errors.scheduledTime}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="calories">Планируемые калории</Label>
              <Input
                id="calories"
                type="number"
                placeholder="Например: 500"
                value={plannedCalories}
                onChange={(e) => setPlannedCalories(e.target.value)}
                className={errors.plannedCalories ? "border-red-500" : ""}
              />
              {errors.plannedCalories && <p className="text-sm text-red-500">{errors.plannedCalories}</p>}
            </div>

            {/* Days */}
            <div className="grid gap-2">
              <Label>Дни недели</Label>
              <div className="flex gap-2 flex-wrap">
                {DAYS.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`meal-${day.value}`}
                      checked={selectedDays.includes(day.value)}
                      onCheckedChange={() => handleDayToggle(day.value)}
                    />
                    <label
                      htmlFor={`meal-${day.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {day.label}
                    </label>
                  </div>
                ))}
              </div>
              {errors.days && <p className="text-sm text-red-500">{errors.days}</p>}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit">
              {initialData ? "Сохранить" : "Добавить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
