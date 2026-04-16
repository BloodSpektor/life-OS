// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Food types
export interface FoodItem {
  id: string;
  userId: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate?: Date;
  addedDate: Date;
  category?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

export interface Meal {
  id: string;
  userId: string;
  name?: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: Date;
  totalCalories?: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFats?: number;
  items: MealItem[];
}

export interface MealItem {
  id: string;
  mealId: string;
  foodItemId?: string;
  customName?: string;
  quantity: number;
  unit: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

// Hydration types
export interface HydrationLog {
  id: string;
  userId: string;
  amount: number; // in ml
  date: Date;
}

// Workout types
export interface Workout {
  id: string;
  userId: string;
  name: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
  duration: number; // in minutes
  caloriesBurned?: number;
  notes?: string;
  date: Date;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'meal' | 'medication' | 'water' | 'workout' | 'sleep';
  title: string;
  message?: string;
  scheduledTime: Date;
  isRecurring: boolean;
  isActive: boolean;
  createdAt: Date;
}

// DTOs
export interface CreateFoodItemDto {
  name: string;
  quantity: number;
  unit: string;
  expiryDate?: Date;
  category?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

export interface CreateMealDto {
  name?: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date?: Date;
  items: CreateMealItemDto[];
}

export interface CreateMealItemDto {
  foodItemId?: string;
  customName?: string;
  quantity: number;
  unit: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

export interface CreateHydrationLogDto {
  amount: number;
  date?: Date;
}

export interface CreateWorkoutDto {
  name: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
  duration: number;
  caloriesBurned?: number;
  notes?: string;
  date?: Date;
}

export interface CreateNotificationDto {
  type: 'meal' | 'medication' | 'water' | 'workout' | 'sleep';
  title: string;
  message?: string;
  scheduledTime: Date;
  isRecurring?: boolean;
}

// Auth types
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
