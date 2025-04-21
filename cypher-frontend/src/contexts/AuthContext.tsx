import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { API_URL } from '@/config';
import { User } from '@/interfaces/auth';
import { checkAuthStatus, logoutUser } from '@/services/api/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const initialCheckInitiated = useRef(false);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    const userData = await checkAuthStatus();
    if (userData) {
      setUser(userData);
      return true;
    } else {
      setUser(null);
      return false;
    }
  }, []);

  useEffect(() => {
    if (!initialCheckInitiated.current) {
      initialCheckInitiated.current = true;
      setLoading(true);
      checkAuth().finally(() => {
        setLoading(false);
      });
    }
  }, [checkAuth]);

  const login = () => {
    window.location.href = `${API_URL}/auth/login`;
  };

  const logout = async () => {
    setLoading(true);
    await logoutUser();
    setUser(null);
    initialCheckInitiated.current = false;
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
    setLoading(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
