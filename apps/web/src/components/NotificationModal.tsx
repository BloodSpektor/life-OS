"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface NotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    category: string;
    title: string;
    time: string;
    days: string[];
    comment?: string;
  }) => void;
  initialData?: {
    id: string;
    category: string;
    title: string;
    time: string;
    days: string[];
    comment?: string;
  };
}

const CATEGORIES = [
  { value: "прием пищи", label: "Прием пищи" },
  { value: "лекарства", label: "Лекарства" },
  { value: "вода", label: "Вода" },
  { value: "тренировка", label: "Тренировка" },
  { value: "сон", label: "Сон" },
];

const DAYS = [
  { value: "Пн", label: "Пн" },
  { value: "Вт", label: "Вт" },
  { value: "Ср", label: "Ср" },
  { value: "Чт", label: "Чт" },
  { value: "Пт", label: "Пт" },
  { value: "Сб", label: "Сб" },
  { value: "Вс", label: "Вс" },
];

export function NotificationModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: NotificationModalProps) {
  const [category, setCategory] = useState(initialData?.category || "прием пищи");
  const [title, setTitle] = useState(initialData?.title || "");
  const [time, setTime] = useState(initialData?.time || "");
  const [selectedDays, setSelectedDays] = useState<string[]>(initialData?.days || ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]);
  const [comment, setComment] = useState(initialData?.comment || "");
  
  // Динамические поля для разных категорий
  const [calories, setCalories] = useState("");
  const [waterAmount, setWaterAmount] = useState("");
  const [sleepDuration, setSleepDuration] = useState("");
  const [medication, setMedication] = useState("");
  const [workoutType, setWorkoutType] = useState("");
  
  const [errors, setErrors] = useState<{
    category?: string;
    title?: string;
    time?: string;
    days?: string;
    dynamicField?: string;
  }>({});

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category);
      setTitle(initialData.title);
      setTime(initialData.time);
      setSelectedDays(initialData.days);
      setComment(initialData.comment || "");
      
      // Парсим динамические поля из comment
      const commentText = initialData.comment || "";
      if (initialData.category === "прием пищи") {
        const match = commentText.match(/(\d+)\s*ккал/);
        if (match) setCalories(match[1]);
      } else if (initialData.category === "вода") {
        const match = commentText.match(/(\d+)\s*стаканов/);
        if (match) setWaterAmount(match[1]);
      } else if (initialData.category === "сон") {
        const match = commentText.match(/(\d+)\s*часов/);
        if (match) setSleepDuration(match[1]);
      } else if (initialData.category === "лекарства") {
        const match = commentText.match(/Дозировка:\s*(.+)/);
        if (match) setMedication(match[1]);
      } else if (initialData.category === "тренировка") {
        const match = commentText.match(/Тип:\s*(.+)/);
        if (match) setWorkoutType(match[1]);
      }
    }
  }, [initialData]);

  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    if (!category) {
      newErrors.category = "Категория обязательна";
    }

    if (!title.trim()) {
      newErrors.title = "Название обязательно";
    }

    if (!time.trim()) {
      newErrors.time = "Время обязательно";
    } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      newErrors.time = "Неверный формат времени (HH:MM)";
    }

    if (selectedDays.length === 0) {
      newErrors.days = "Выберите хотя бы один день";
    }

    // Валидация динамических полей
    if (category === "прием пищи" && (!calories || parseFloat(calories) <= 0)) {
      newErrors.dynamicField = "Укажите калории";
    } else if (category === "вода" && (!waterAmount || parseFloat(waterAmount) <= 0)) {
      newErrors.dynamicField = "Укажите количество воды";
    } else if (category === "сон" && (!sleepDuration || parseFloat(sleepDuration) <= 0)) {
      newErrors.dynamicField = "Укажите продолжительность сна";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Формируем comment на основе категории
    let generatedComment = "";
    if (category === "прием пищи") {
      generatedComment = `Планируемые калории: ${calories} ккал`;
    } else if (category === "вода") {
      generatedComment = `Количество: ${waterAmount} стаканов`;
    } else if (category === "сон") {
      generatedComment = `Продолжительность: ${sleepDuration} часов`;
    } else if (category === "лекарства" && medication) {
      generatedComment = `Дозировка: ${medication}`;
    } else if (category === "тренировка" && workoutType) {
      generatedComment = `Тип: ${workoutType}`;
    } else {
      generatedComment = comment.trim();
    }

    onSubmit({
      category,
      title: title.trim(),
      time: time.trim(),
      days: selectedDays,
      comment: generatedComment || undefined,
    });

    handleClose();
  };

  const handleClose = () => {
    if (!initialData) {
      setCategory("прием пищи");
      setTitle("");
      setTime("");
      setSelectedDays(["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]);
      setComment("");
      setCalories("");
      setWaterAmount("");
      setSleepDuration("");
      setMedication("");
      setWorkoutType("");
    }
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Редактировать напоминание" : "Создать напоминание"}
          </DialogTitle>
          <DialogDescription>
            Настройте параметры уведомления
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Category */}
            <div className="grid gap-2">
              <Label htmlFor="category">Категория</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>

            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">Название уведомления</Label>
              <Input
                id="title"
                placeholder="Например: Завтрак"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            {/* Time */}
            <div className="grid gap-2">
              <Label htmlFor="time">Время</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={errors.time ? "border-red-500" : ""}
              />
              {errors.time && <p className="text-sm text-red-500">{errors.time}</p>}
            </div>

            {/* Days */}
            <div className="grid gap-2">
              <Label>Дни недели</Label>
              <div className="flex gap-2 flex-wrap">
                {DAYS.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.value}
                      checked={selectedDays.includes(day.value)}
                      onCheckedChange={() => handleDayToggle(day.value)}
                    />
                    <label
                      htmlFor={day.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {day.label}
                    </label>
                  </div>
                ))}
              </div>
              {errors.days && <p className="text-sm text-red-500">{errors.days}</p>}
            </div>

            {/* Динамические поля в зависимости от категории */}
            {category === "прием пищи" && (
              <div className="grid gap-2">
                <Label htmlFor="calories">Планируемые калории</Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="Например: 500"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className={errors.dynamicField ? "border-red-500" : ""}
                />
                {errors.dynamicField && <p className="text-sm text-red-500">{errors.dynamicField}</p>}
              </div>
            )}

            {category === "вода" && (
              <div className="grid gap-2">
                <Label htmlFor="water">Количество стаканов</Label>
                <Input
                  id="water"
                  type="number"
                  placeholder="Например: 8"
                  value={waterAmount}
                  onChange={(e) => setWaterAmount(e.target.value)}
                  className={errors.dynamicField ? "border-red-500" : ""}
                />
                {errors.dynamicField && <p className="text-sm text-red-500">{errors.dynamicField}</p>}
              </div>
            )}

            {category === "сон" && (
              <div className="grid gap-2">
                <Label htmlFor="sleep">Продолжительность (часов)</Label>
                <Input
                  id="sleep"
                  type="number"
                  placeholder="Например: 8"
                  value={sleepDuration}
                  onChange={(e) => setSleepDuration(e.target.value)}
                  className={errors.dynamicField ? "border-red-500" : ""}
                />
                {errors.dynamicField && <p className="text-sm text-red-500">{errors.dynamicField}</p>}
              </div>
            )}

            {category === "лекарства" && (
              <div className="grid gap-2">
                <Label htmlFor="medication">Дозировка (необязательно)</Label>
                <Input
                  id="medication"
                  placeholder="Например: 1 таблетка"
                  value={medication}
                  onChange={(e) => setMedication(e.target.value)}
                />
              </div>
            )}

            {category === "тренировка" && (
              <div className="grid gap-2">
                <Label htmlFor="workout">Тип тренировки (необязательно)</Label>
                <Input
                  id="workout"
                  placeholder="Например: Бег"
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit">{initialData ? "Сохранить" : "Создать"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
