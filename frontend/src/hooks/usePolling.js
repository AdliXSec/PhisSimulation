import { useEffect, useRef } from 'react';

/**
 * Custom hook for automatic data polling (real-time updates).
 * 
 * @param {Function} fetchFn - Async function to call periodically
 * @param {number} intervalMs - Polling interval in milliseconds (default: 5000)
 * @param {boolean} enabled - Whether polling is active (default: true)
 */
export default function usePolling(fetchFn, intervalMs = 5000, enabled = true) {
  const savedCallback = useRef(fetchFn);

  // Always keep the latest callback reference
  useEffect(() => {
    savedCallback.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      savedCallback.current();
    };

    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}
