// src/hooks/useNavbarVisibility.js
import { useState, useEffect, useRef, useCallback } from "react";

export function useNavbarVisibility(hideDelay = 1000, showThresholdPx = 50) {
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef(null);

  const clearExistingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleMouseMove = useCallback(
    (event) => {
      // If cursor is within `showThresholdPx` pixels from the top, show navbar
      if (event.clientY <= showThresholdPx) {
        setIsVisible(true);
        clearExistingTimeout();
      } else {
        // Otherwise, schedule hiding after `hideDelay` ms
        clearExistingTimeout();
        timeoutRef.current = setTimeout(() => {
          setIsVisible(false);
        }, hideDelay);
      }
    },
    [hideDelay, showThresholdPx, clearExistingTimeout]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearExistingTimeout();
    };
  }, [handleMouseMove, clearExistingTimeout]);

  return isVisible;
}
