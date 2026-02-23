import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";

const AuthContext = createContext(null);

const STORAGE_TOKEN = "tutors_access_token";
const STORAGE_USER = "tutors_current_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN) || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(STORAGE_USER);
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_TOKEN);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_USER);
    }
  }, [user]);

  const login = async ({ email, userType }) => {
    setLoading(true);
    try {
      const response = await api.login(email, userType);
      if (response?.access_token) {
        setToken(response.access_token);
        setUser(response.user);
      }
      return response;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ email, userType, uniqueId, bursaryName }) => {
    setLoading(true);
    try {
      const response = await api.registerUser({ email, userType, uniqueId, bursaryName });
      if (response?.access_token) {
        setToken(response.access_token);
        setUser(response.user);
      }
      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken("");
    setUser(null);
  };

  const refreshProfile = useCallback(async () => {
    if (!token) {
      return null;
    }
    const profile = await api.getProfile();
    if (profile) {
      setUser(profile);
    }
    return profile;
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      refreshProfile,
    }),
    [token, user, loading, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
