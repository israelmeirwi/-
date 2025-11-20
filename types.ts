
export interface Log {
  id: string;
  timestamp: number;
  type: 'smoked' | 'craving_beaten';
  note?: string;
  pointsEarned?: number;
}

export interface UserConfig {
  isOnboarded: boolean;
  dailyLimit: number; // Target max cigarettes per day
  averageBeforeQuitting: number; // How many they used to smoke
  packPrice: number; // Price in NIS
  cigarettesPerPack: number;
  startDate: number;
  name: string;
  score: number; // Current gamification score
}

export interface DashboardStats {
  smokedToday: number;
  limit: number;
  moneySavedToday: number;
  moneySavedTotal: number;
  lastCigaretteTime: number | null;
  streakHours: number;
  streakMinutes: number;
  nextAllowedTime: number; // Timestamp when the next cigarette is "allowed"
  intervalMinutes: number; // The target gap between cigarettes
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  ONBOARDING = 'ONBOARDING',
  LOGGING = 'LOGGING',
  CRAVING = 'CRAVING',
  STATS = 'STATS',
  WATCH = 'WATCH',
  LEADERBOARD = 'LEADERBOARD'
}
