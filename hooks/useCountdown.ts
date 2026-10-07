// ============================================================
// Rave Connect — Countdown Hook
// ============================================================
import { useState, useEffect, useRef, useCallback } from 'react';
import { getSecondsUntil, formatCountdown } from '@/lib/utils';

interface UseCountdownReturn {
  timeLeft: string;
  secondsLeft: number;
  isExpired: boolean;
}

export function useCountdown(targetTime: string): UseCountdownReturn {
  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsUntil(targetTime));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Recalculate on mount
    setSecondsLeft(getSecondsUntil(targetTime));

    intervalRef.current = setInterval(() => {
      const remaining = getSecondsUntil(targetTime);
      setSecondsLeft(remaining);

      if (remaining <= 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [targetTime]);

  return {
    timeLeft: formatCountdown(secondsLeft),
    secondsLeft,
    isExpired: secondsLeft <= 0,
  };
}
