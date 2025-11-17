"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

interface UseSessionTimeoutProps {
  onTimeout: () => void;
  onWarning?: () => void;
}

export const useSessionTimeout = ({ onTimeout, onWarning }: UseSessionTimeoutProps) => {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();

    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    // Set new warning timer (5 minutes before timeout)
    warningRef.current = setTimeout(() => {
      if (onWarning) {
        onWarning();
      }
    }, SESSION_TIMEOUT - WARNING_TIME);

    // Set new timeout timer
    timeoutRef.current = setTimeout(() => {
      onTimeout();
    }, SESSION_TIMEOUT);
  }, [onTimeout, onWarning]);

  const logout = useCallback(() => {
    // Clear stored session data
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("role");

    // Clear timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    // Redirect to login
    router.push("/");
  }, [router]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    // Check if user is logged in
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.log("No token found, session timeout not active");
      return;
    }

    console.log("Session timeout initialized for logged-in user");

    // Initialize timer
    resetTimer();

    // Activity event handlers
    const handleActivity = () => {
      console.log("User activity detected, resetting timer");
      resetTimer();
    };

    // Add event listeners for user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click"
    ];

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup function
    return () => {
      console.log("Cleaning up session timeout listeners");
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
    };
  }, [resetTimer]);

  return { logout, resetTimer };
};