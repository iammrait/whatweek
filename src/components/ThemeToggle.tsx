"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "auto";
const STORAGE_KEY = "ww-theme";

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "auto") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "auto") return stored;
  } catch {}
  return "auto";
}

type Props = {
  labelLight: string;
  labelDark: string;
  labelAuto: string;
  ariaLabel: string;
};

export function ThemeToggle({ labelLight, labelDark, labelAuto, ariaLabel }: Props) {
  const [theme, setTheme] = useState<Theme>(readStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const select = (next: Theme) => {
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  };

  return (
    <div className="themeToggle" role="group" aria-label={ariaLabel}>
      <button
        type="button"
        aria-pressed={theme === "light"}
        className={theme === "light" ? "themeActive" : undefined}
        onClick={() => select("light")}
        title={labelLight}
      >
        <span aria-hidden="true">☀</span>
        <span className="srOnly">{labelLight}</span>
      </button>
      <button
        type="button"
        aria-pressed={theme === "auto"}
        className={theme === "auto" ? "themeActive" : undefined}
        onClick={() => select("auto")}
        title={labelAuto}
      >
        <span aria-hidden="true">◐</span>
        <span className="srOnly">{labelAuto}</span>
      </button>
      <button
        type="button"
        aria-pressed={theme === "dark"}
        className={theme === "dark" ? "themeActive" : undefined}
        onClick={() => select("dark")}
        title={labelDark}
      >
        <span aria-hidden="true">☾</span>
        <span className="srOnly">{labelDark}</span>
      </button>
    </div>
  );
}

export const themeBootstrapScript = `
(function(){
  try {
    var stored = localStorage.getItem('${STORAGE_KEY}');
    if (stored === 'dark' || stored === 'light') {
      document.documentElement.setAttribute('data-theme', stored);
    }
  } catch (e) {}
})();
`;