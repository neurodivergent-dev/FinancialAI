import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_USER_KEY = 'guest_user';

interface AuthContextType {
  isAuthenticated: boolean | null;
  session: any | null;
  user: any | null;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: () => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const guestUser = await AsyncStorage.getItem(GUEST_USER_KEY);
        if (guestUser === 'true') {
          setIsAuthenticated(true);
          setIsGuest(true);
        } else {
          setIsAuthenticated(false);
          setIsGuest(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Basic local "login" - can be extended or replaced
    // For now, removing Supabase means auth is local/guest oriented
    return { success: false, error: 'Hesap özelliği şu an kullanım dışı. Lütfen Misafir olarak devam edin.' };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    return { success: false, error: 'Google girişi şu an kullanım dışı.' };
  };

  const loginAsGuest = async () => {
    try {
      await AsyncStorage.setItem(GUEST_USER_KEY, 'true');
      setIsAuthenticated(true);
      setIsGuest(true);
      setSession(null);
      setUser(null);
      return true;
    } catch (error) {
      console.error('Guest login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(GUEST_USER_KEY);
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
      setIsGuest(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        session,
        user,
        isGuest,
        login,
        loginWithGoogle,
        loginAsGuest,
        logout,
        loading: isAuthenticated === null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
