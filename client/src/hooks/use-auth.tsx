import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, AuthUser, LoginCredentials } from '@/types';
import { apiRequest } from '@/lib/queryClient';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Check for existing session
    const userData = localStorage.getItem('auth-user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch {
        localStorage.removeItem('auth-user');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      const data = await response.json();
      
      const user: AuthUser = data.user;
      
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
      
      localStorage.setItem('auth-user', JSON.stringify(user));
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = () => {
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
    localStorage.removeItem('auth-user');
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Custom hook for authenticated API requests
export function useAuthenticatedRequest() {
  const { user } = useAuth();
  
  const makeRequest = async (method: string, url: string, data?: unknown) => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'user-id': user.id,
        'user-role': user.role,
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status}: ${errorText}`);
    }
    
    return response;
  };
  
  return makeRequest;
}
