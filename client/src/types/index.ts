export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent';
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export * from '@shared/schema';
