import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('phisim_token');
    const savedUser = localStorage.getItem('phisim_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('phisim_token', access_token);
    localStorage.setItem('phisim_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const googleLogin = async (tokenData) => {
    const res = await api.post('/auth/google', tokenData);
    const { access_token, user: userData } = res.data;
    localStorage.setItem('phisim_token', access_token);
    localStorage.setItem('phisim_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('phisim_token');
    localStorage.removeItem('phisim_user');
    setUser(null);
  };

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      const userData = res.data;
      localStorage.setItem('phisim_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Failed to fetch user', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, googleLogin, logout, fetchUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
