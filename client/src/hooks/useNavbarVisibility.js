// src/hooks/useNavbarVisibility.js
import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Hook that returns a boolean indicating whether the navbar should be visible or not.
 * Listens to `mousemove` events and shows the navbar when the mouse is within
 * `showThresholdPx` pixels from the top of the window, and hides it after
 * `hideDelay` ms if the mouse hasn't moved.
 *
 * @param {number} [hideDelay=1000] - The delay (in ms) after which the navbar
 *   should be hidden if the mouse hasn't moved.
 * @param {number} [showThresholdPx=50] - The number of pixels from the top of
 *   the window that the mouse should be within to show the navbar.
 *
 * @returns {boolean} Whether the navbar should be visible or not.
 */

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
