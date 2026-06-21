"use client";

import { cn } from "@zenncore/utils";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { MoonIcon, SunIcon } from "@/components/medical-icons";

type Theme = "light" | "dark";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => undefined,
});

const STORAGE_KEY = "mediscan-theme";

/**
 * Theme is scoped to the app shell — the `.light` class is set here, not on
 * <html>, so the sign-in page (a separate tree) always stays dark. The wrapper
 * is `display: contents`, so it sets the light tokens without adding a box.
 */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);

  const toggle = () =>
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <div className={cn("contents", theme === "light" && "light")}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

export const ThemeToggle = () => {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        theme === "dark" ? "Kalo në temë të çelët" : "Kalo në temë të errët"
      }
      className="flex size-9 shrink-0 items-center justify-center rounded-full border border-accent/60 bg-accent/40 text-foreground-dimmed transition-colors hover:bg-accent/60 hover:text-foreground"
    >
      {theme === "dark" ? (
        <SunIcon className="size-4" />
      ) : (
        <MoonIcon className="size-4" />
      )}
    </button>
  );
};
