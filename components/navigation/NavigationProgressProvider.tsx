"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

type NavigationProgressContextValue = {
  isNavigating: boolean;
  startNavigation: () => void;
};

const NavigationProgressContext = createContext<NavigationProgressContextValue | null>(null);

export function NavigationProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPendingTimeout = useCallback(() => {
    if (!timeoutRef.current) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const startNavigation = useCallback(() => {
    clearPendingTimeout();
    setIsNavigating(true);

    // Safety fallback in case navigation fails silently.
    timeoutRef.current = setTimeout(() => {
      setIsNavigating(false);
      timeoutRef.current = null;
    }, 15000);
  }, [clearPendingTimeout]);

  useEffect(() => {
    setIsNavigating(false);
    clearPendingTimeout();
  }, [pathname, clearPendingTimeout]);

  useEffect(() => {
    return () => clearPendingTimeout();
  }, [clearPendingTimeout]);

  const value = useMemo(
    () => ({
      isNavigating,
      startNavigation,
    }),
    [isNavigating, startNavigation]
  );

  return (
    <NavigationProgressContext.Provider value={value}>
      {children}

      {isNavigating && (
        <>
          <div className="fixed inset-0 z-[100] bg-[var(--clr-navy)]/35 backdrop-blur-[12px]" />
          <div className="fixed inset-0 z-[101] grid place-items-center">
            <div
              role="status"
              aria-live="polite"
              className="inline-flex min-w-52 items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 text-sm font-semibold text-[var(--clr-navy)] shadow-2xl"
            >
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--clr-navy)]/30 border-t-[var(--clr-gold)]" />
              Redirecting...
            </div>
          </div>
        </>
      )}
    </NavigationProgressContext.Provider>
  );
}

export function useNavigationProgress() {
  const context = useContext(NavigationProgressContext);
  if (!context) {
    throw new Error("useNavigationProgress must be used within NavigationProgressProvider");
  }
  return context;
}
