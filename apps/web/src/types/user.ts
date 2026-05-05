export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  dateOfBirth?: string;
  createdAt?: string;
}

export interface SubscriptionStatus {
  plan: 'free' | 'premium' | 'trial';
  status: 'active' | 'expired' | 'canceled';
  startsAt?: string;
  endsAt?: string;
}

export interface UpdateUserProfileDto {
  name?: string;
  email?: string;
  avatarUrl?: string;
  phone?: string;
  dateOfBirth?: string;
}