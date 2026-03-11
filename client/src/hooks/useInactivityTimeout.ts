import { useEffect, useRef } from "react";

const INACTIVITY_TIMEOUT = 3 * 60 * 1000; // 3 minutes in milliseconds

export function useInactivityTimeout(onTimeout: () => void) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      onTimeout();
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    // Set initial timeout
    resetTimeout();

    // Track user activity
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];

    const handleActivity = () => {
      resetTimeout();
    };

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [onTimeout]);
}
