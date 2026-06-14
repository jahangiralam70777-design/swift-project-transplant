import { useCallback, useEffect, useState } from "react";

export type ScopedTheme = "light" | "dark";
const GLOBAL_STORAGE_KEY = "edumaster.theme";

/**
 * MCQ Practice theme hook — mirrors the GLOBAL app theme (`<html>.dark`)
 * so the global theme toggle (DashTopbar) instantly switches the whole
 * MCQ Practice page. The in-page toggle also flips the global theme,
 * so the two stay in sync. Persistence uses the same `edumaster.theme`
 * key as the rest of the app.
 */
function readGlobal(): ScopedTheme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function useScopedTheme() {
  const [theme, setTheme] = useState<ScopedTheme>(readGlobal);

  // Live sync: observe `<html>` class changes so any global toggle
  // (DashTopbar, settings, system) updates the scoped wrapper instantly.
  useEffect(() => {
    if (typeof document === "undefined") return;
    setTheme(readGlobal());
    const root = document.documentElement;
    const obs = new MutationObserver(() => setTheme(readGlobal()));
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const toggle = useCallback(() => {
    const next: ScopedTheme = readGlobal() === "dark" ? "light" : "dark";
    try {
      document.documentElement.classList.toggle("dark", next === "dark");
      localStorage.setItem(GLOBAL_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    setTheme(next);
  }, []);

  const themeClass = theme === "dark" ? "mcq-scope dark" : "mcq-scope mcq-theme-light";
  return { theme, toggle, themeClass };
}
