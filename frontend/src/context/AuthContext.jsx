import React, { createContext, useContext, useState, useEffect } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkAuth() {
    setLoading(true);
    try {
      const currentUser = await authApi.getMe();
      setUser(currentUser);
    } catch (err) {
      // 401 = not logged in (normal)
      if (err?.status === 401) {
        setUser(null);
      } else {
        setUser(null);
        setError(err?.message || "Auth check failed");
      }
    } finally {
      setLoading(false);
    }
  }

  async function loginUser(payload) {
    setError(null);
    setLoading(true);
    try {
      // 1) perform login (should set cookie)
      await authApi.login(payload);

      // 2) fetch the actual user from /auth/me
      const currentUser = await authApi.getMe();
      setUser(currentUser);
      return currentUser;
    } catch (err) {
      setUser(null);
      setError(err?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }
  /*
  Anthony Powell - Lines 56 - 71
  Admin login context method - Similar to regular login but calls adminLogin API and has different error messaging. 
  */
  async function loginAdminUser(payload) {
    setError(null);
    setLoading(true);
    try {
      await authApi.adminLogin(payload);
      const currentUser = await authApi.getMe();
      setUser(currentUser);
      return currentUser;
    } catch (err) {
      setUser(null);
      setError(err?.message || "Admin login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function registerUser(payload) {
    setError(null);
    setLoading(true);
    try {
      await authApi.register(payload);

      // If register also logs them in via cookie, fetch /me
      const currentUser = await authApi.getMe();
      setUser(currentUser);
      return currentUser;
    } catch (err) {
      setUser(null);
      setError(err?.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function logoutUser() {
    setError(null);
    setLoading(true);
    try {
      await authApi.logout();
      setUser(null);
    } catch (err) {
      setError(err?.message || "Logout failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function clearError() {
    setError(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login: loginUser,
        adminLogin: loginAdminUser,
        register: registerUser,
        logout: logoutUser,
        clearError,
        refresh: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}