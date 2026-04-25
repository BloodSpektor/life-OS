"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FoodItemModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: {
        name: string;
        category: string;
        quantity: number;
        unit: string;
        expiryDate?: string;
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    }) => void;
    existingCategories: string[];
    initialData?: {
        id: string;
        name: string;
        category: string;
        quantity: number;
        unit: string;
        expiryDate?: string;
        calories: number;
        protein?: number;
        carbs?: number;
        fats?: number;
    };
}

const UNIT_OPTIONS = [
    { value: "г", label: "г (граммы)" },
    { value: "кг", label: "кг (килограммы)" },
    { value: "мл", label: "мл (миллилитры)" },
    { value: "л", label: "л (литры)" },
    { value: "шт", label: "шт (штуки)" },
];

export function FoodItemModal({ open, onOpenChange, onSubmit, existingCategories, initialData }: FoodItemModalProps) {
    const [name, setName] = useState(initialData?.name || "");
    const [category, setCategory] = useState(initialData?.category || "");
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [quantity, setQuantity] = useState(initialData?.quantity?.toString() || "");
    const [unit, setUnit] = useState(initialData?.unit || "г");
    const [expiryDate, setExpiryDate] = useState(initialData?.expiryDate || "");
    const [calories, setCalories] = useState(initialData?.calories?.toString() || "");
    const [protein, setProtein] = useState(initialData?.protein?.toString() || "");
    const [carbs, setCarbs] = useState(initialData?.carbs?.toString() || "");
    const [fats, setFats] = useState(initialData?.fats?.toString() || "");
    const [errors, setErrors] = useState<{
        name?: string;
        category?: string;
        quantity?: string;
        unit?: string;
        calories?: string;
        protein?: string;
        carbs?: string;
        fats?: string;
    }>({});

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setCategory(initialData.category);
            setQuantity(initialData.quantity.toString());
            setUnit(initialData.unit);
            setExpiryDate(initialData.expiryDate || "");
            setCalories(initialData.calories.toString());
            setProtein(initialData.protein?.toString() || "");
            setCarbs(initialData.carbs?.toString() || "");
            setFats(initialData.fats?.toString() || "");
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: typeof errors = {};

        if (!name.trim()) {
            newErrors.name = "Название обязательно";
        }

        const finalCategory = isNewCategory ? newCategoryName.trim() : category;
        if (!finalCategory) {
            newErrors.category = "Категория обязательна";
        }

        const quantityNum = parseFloat(quantity);
        if (!quantity.trim() || isNaN(quantityNum) || quantityNum <= 0) {
            newErrors.quantity = "Количество должно быть больше 0";
        }

        if (!unit) {
            newErrors.unit = "Единица измерения обязательна";
        }

        const caloriesNum = parseFloat(calories);
        if (!calories.trim() || isNaN(caloriesNum) || caloriesNum < 0) {
            newErrors.calories = "Калории должны быть >= 0";
        }

        const proteinNum = protein.trim() ? parseFloat(protein) : 0;
        if (isNaN(proteinNum) || proteinNum < 0) {
            newErrors.protein = "Белки должны быть >= 0";
        }

        const carbsNum = carbs.trim() ? parseFloat(carbs) : 0;
        if (isNaN(carbsNum) || carbsNum < 0) {
            newErrors.carbs = "Углеводы должны быть >= 0";
        }

        const fatsNum = fats.trim() ? parseFloat(fats) : 0;
        if (isNaN(fatsNum) || fatsNum < 0) {
            newErrors.fats = "Жиры должны быть >= 0";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit({
            name: name.trim(),
            category: finalCategory,
            quantity: quantityNum,
            unit,
            expiryDate: expiryDate || undefined,
            calories: caloriesNum,
            protein: proteinNum,
            carbs: carbsNum,
            fats: fatsNum,
        });

        handleClose();
    };

    const handleClose = () => {
        if (!initialData) {
            setName("");
            setCategory("");
            setIsNewCategory(false);
            setNewCategoryName("");
            setQuantity("");
            setUnit("г");
            setExpiryDate("");
            setCalories("");
            setProtein("");
            setCarbs("");
            setFats("");
        }
        setErrors({});
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Редактировать продукт" : "Добавить продукт"}</DialogTitle>
                    <DialogDescription>Заполните информацию о продукте</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Category */}
                        <div className="grid gap-2">
                            <Label htmlFor="category">Категория</Label>
                            {!isNewCategory ? (
                                <div className="flex gap-2">
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                                            <SelectValue placeholder="Выберите категорию" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {existingCategories.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button type="button" variant="outline" onClick={() => setIsNewCategory(true)}>
                                        Новая
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Название новой категории"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className={errors.category ? "border-red-500" : ""}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsNewCategory(false);
                                            setNewCategoryName("");
                                        }}
                                    >
                                        Отмена
                                    </Button>
                                </div>
                            )}
                            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                        </div>

                        {/* Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Название продукта</Label>
                            <Input
                                id="name"
                                placeholder="Например: Молоко"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={errors.name ? "border-red-500" : ""}
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

                        {/* Quantity and Unit */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="quantity">Количество</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    step="0.01"
                                    placeholder="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className={errors.quantity ? "border-red-500" : ""}
                                />
                                {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="unit">Единица</Label>
                                <Select value={unit} onValueChange={setUnit}>
                                    <SelectTrigger className={errors.unit ? "border-red-500" : ""}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {UNIT_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.unit && <p className="text-sm text-red-500">{errors.unit}</p>}
                            </div>
                        </div>

                        {/* Expiry Date */}
                        <div className="grid gap-2">
                            <Label htmlFor="expiryDate">Срок годности (необязательно)</Label>
                            <Input id="expiryDate" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                        </div>

                        {/* Nutrition per 100g/100ml */}
                        <div className="grid gap-2">
                            <p className="text-sm text-gray-500 font-medium">Пищевая ценность на 100{unit === "шт" ? " шт" : unit}</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="calories">Калории (ккал)</Label>
                                    <Input
                                        id="calories"
                                        type="number"
                                        step="1"
                                        placeholder="100"
                                        value={calories}
                                        onChange={(e) => setCalories(e.target.value)}
                                        className={errors.calories ? "border-red-500" : ""}
                                    />
                                    {errors.calories && <p className="text-sm text-red-500">{errors.calories}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="protein">Белки (г)</Label>
                                    <Input
                                        id="protein"
                                        type="number"
                                        step="0.1"
                                        placeholder="0"
                                        value={protein}
                                        onChange={(e) => setProtein(e.target.value)}
                                        className={errors.protein ? "border-red-500" : ""}
                                    />
                                    {errors.protein && <p className="text-sm text-red-500">{errors.protein}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="carbs">Углеводы (г)</Label>
                                    <Input
                                        id="carbs"
                                        type="number"
                                        step="0.1"
                                        placeholder="0"
                                        value={carbs}
                                        onChange={(e) => setCarbs(e.target.value)}
                                        className={errors.carbs ? "border-red-500" : ""}
                                    />
                                    {errors.carbs && <p className="text-sm text-red-500">{errors.carbs}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="fats">Жиры (г)</Label>
                                    <Input
                                        id="fats"
                                        type="number"
                                        step="0.1"
                                        placeholder="0"
                                        value={fats}
                                        onChange={(e) => setFats(e.target.value)}
                                        className={errors.fats ? "border-red-500" : ""}
                                    />
                                    {errors.fats && <p className="text-sm text-red-500">{errors.fats}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Отмена
                        </Button>
                        <Button type="submit">{initialData ? "Сохранить" : "Добавить"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
