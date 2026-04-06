import { useState, useEffect } from "react";

/**
 * Simulates a loading state for a given duration.
 * Useful for skeleton loaders while data would be fetched.
 */
export function useSimulatedLoading(durationMs = 800) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), durationMs);
    return () => clearTimeout(timer);
  }, [durationMs]);

  return loading;
}
