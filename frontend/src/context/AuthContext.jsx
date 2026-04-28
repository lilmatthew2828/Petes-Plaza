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
      // Small optimization: If there's no token, don't even bother pinging the server
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const currentUser = await authApi.getMe();
      setUser(currentUser);
    } catch (err) {
      // 401 = not logged in or token expired (normal)
      if (err?.status === 401) {
        localStorage.removeItem("token"); // Clean up the dead token!
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
      // 1) perform login and capture the response
      const response = await authApi.login(payload);

      // NEW: Save the token to the browser's memory!
      // (Assuming your backend now returns { token: "...", ... })
      if (response && response.token) {
        localStorage.setItem("token", response.token);
      }

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
      const response = await authApi.adminLogin(payload);
      
      // NEW: Save the admin token!
      if (response && response.token) {
        localStorage.setItem("token", response.token);
      }

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
      const response = await authApi.register(payload);

      // NEW: If your register route automatically logs them in and returns a token, save it!
      if (response && response.token) {
        localStorage.setItem("token", response.token);
      }

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
      // Tell the server to revoke the session
      await authApi.logout();
    } catch (err) {
      console.warn("Server logout failed or token already invalid", err);
      // We don't throw the error here, because we STILL want to wipe local storage below.
    } finally {
      // NEW: Destroy the token on logout no matter what happens with the server!
      localStorage.removeItem("token");
      setUser(null);
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