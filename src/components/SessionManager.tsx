"use client";

import { useState, useEffect } from "react";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import SessionTimeoutModal from "./SessionTimeoutModal";

const SessionManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Only run on client side to prevent SSR issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { logout } = useSessionTimeout({
    onTimeout: () => {
      console.log("Session timeout triggered, showing modal");
      setShowTimeoutModal(true);
    },
    onWarning: () => {
      // Optional: Show a warning toast 5 minutes before timeout
      console.log("Session will expire in 5 minutes");
      // You can add a toast notification here if desired
    },
  });

  const handleTimeoutConfirm = () => {
    console.log("User confirmed timeout, logging out");
    setShowTimeoutModal(false);
    logout();
  };

  // Don't render session management on server side
  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <SessionTimeoutModal
        open={showTimeoutModal}
        onClose={() => setShowTimeoutModal(false)}
        onConfirm={handleTimeoutConfirm}
      />
    </>
  );
};

export default SessionManager;