import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('clinovexa_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.user);
        } catch (err) {
          console.error('Failed to fetch user context:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password, role) => {
    const res = await api.post('/auth/login', { email, password, role });
    if (res.token) {
      localStorage.setItem('clinovexa_token', res.token);
      localStorage.setItem('clinovexa_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
    }
    return res.user;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.token) {
      localStorage.setItem('clinovexa_token', res.token);
      localStorage.setItem('clinovexa_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
    }
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('clinovexa_token');
    localStorage.removeItem('clinovexa_user');
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
