import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { signIn, signUp, signOut, getSession } from '../lib/auth-client';

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch session on mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await getSession();
        if (response.data?.user) {
          setUser(response.data.user as User);
        }
      } catch (err) {
        console.log('No active session');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        return { error: result.error.message || 'Échec de connexion' };
      }
      return {};
    } catch (err) {
      return { error: 'Erreur de connexion au serveur' };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const result = await signUp.email({ email, password, name });
      if (result.error) {
        return { error: result.error.message || 'Échec d\'inscription' };
      }
      return {};
    } catch (err) {
      return { error: 'Erreur de connexion au serveur' };
    }
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
