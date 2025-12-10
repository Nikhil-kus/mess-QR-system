export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner'
}

export interface MealsToday {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

export interface Student {
  id: string; // From DB Key
  name: string;
  room: string;
  phone: string;
  hasPaid: boolean;
  validTill: string; // YYYY-MM-DD
  qrData: string;
  password?: string; // Added for student login
  mealsToday: MealsToday;
}

export interface ScanResult {
  status: 'idle' | 'loading' | 'success' | 'error' | 'warning';
  message: string;
  student?: Student;
}