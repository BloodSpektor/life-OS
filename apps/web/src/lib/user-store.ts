import { create } from "zustand";
import { UserProfile, SubscriptionStatus, UpdateUserProfileDto } from "../types/user";

interface UserState {
  user: UserProfile | null;
  subscription: SubscriptionStatus | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: UserProfile | null) => void;
  setSubscription: (subscription: SubscriptionStatus | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  subscription: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setSubscription: (subscription) => set({ subscription }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearUser: () => set({ user: null, subscription: null, error: null }),
}));