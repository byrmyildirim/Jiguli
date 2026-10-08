import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AuthUser {
  username: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
  loginTime: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  setDirectUser: (user: AuthUser) => void;
}

const AUTH_STORAGE_KEY = 'jiguli_auth_session_v1';

const DEMO_USER: AuthUser = {
  username: 'admin',
  name: 'Sistem Yöneticisi (Admin)',
  role: 'E-Ticaret Yöneticisi (SuperAdmin)',
  avatar: 'SY',
  email: 'admin@jiguli.pro',
  loginTime: ''
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const setDirectUser = (newUser: AuthUser) => {
    setUser(newUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } catch (e) {
      console.warn('Failed to persist auth session', e);
    }
  };

  const login = (username: string, password: string) => {
    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (
      (trimmedUser === 'admin' && trimmedPass) ||
      (trimmedUser === 'demo' && trimmedPass) ||
      (trimmedUser.length >= 2 && trimmedPass.length >= 2)
    ) {
      const authUser: AuthUser = {
        username: trimmedUser,
        name: trimmedUser === 'admin' ? 'Sistem Yöneticisi' : trimmedUser === 'demo' ? 'Çağla Yurtseven (Demo)' : trimmedUser,
        role: 'Sistem Yöneticisi',
        avatar: trimmedUser.slice(0, 2).toUpperCase(),
        email: `${trimmedUser}@jiguli.pro`,
        loginTime: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      };
      setUser(authUser);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      } catch (e) {
        console.warn('Failed to persist auth session', e);
      }
      return { success: true };
    }

    return {
      success: false,
      error: 'Geçersiz kullanıcı adı veya şifre! (Giriş için: Kullanıcı adı: admin veya demo)'
    };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear auth session', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, setDirectUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
