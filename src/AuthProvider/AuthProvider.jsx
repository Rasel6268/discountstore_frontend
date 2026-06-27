'use client';
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/config/api";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const res = await api.get("/auth/me");
      if (res.status === 200) {
        const data = await res.data.user;
        setUser(data);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      return (
        error.response?.data || {
          success: false,
          message: "Registration failed",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const userData = res.data.user;
      setUser(userData);
      toast.success(`Welcome back, ${userData.name}!`);

      // 👇 Parse the URL to check for a redirect param
      const searchParams = new URLSearchParams(window.location.search);
      const redirectUrl = searchParams.get("redirect");

      if (redirectUrl) {
        
        router.push(redirectUrl);
      } else if (userData.role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/profile");
      }

      return {
        success: true,
        user: userData,
      };
    } catch (error) {
      console.error("Login error:", error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Login failed";

      toast.error(message);
      return {
        success: false,
        error: message,
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);

    try {
      const res = await api.post("/auth/logout");
      setUser(null);
      toast.success("Logged out successfully");
      router.push("/auth/login");

      return {
        success: true,
        message: res.data.message,
      };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to log out";
      toast.error(message);
      return {
        success: false,
        error: message,
      };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {};
  const resetPassword = async (token, password) => {};

  const authData = {
    user,
    loading,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
  };

  // 👇 Fixed context provider here!
  return (
    <AuthContext value={authData}>
      {children}
    </AuthContext>
  );
};

export default AuthProvider;