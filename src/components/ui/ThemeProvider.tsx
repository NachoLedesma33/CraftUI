import React, { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage or default to dark mode
    const saved = localStorage.getItem("editor-theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    const root = document.documentElement;

    if (isDark) {
      root.classList.add("dark");
      root.style.setProperty("--bg-primary", "#0f172a"); // slate-900
      root.style.setProperty("--bg-secondary", "#1e293b"); // slate-800
      root.style.setProperty("--bg-tertiary", "#334155"); // slate-700
      root.style.setProperty("--text-primary", "#f8fafc"); // slate-50
      root.style.setProperty("--text-secondary", "#cbd5e1"); // slate-300
      root.style.setProperty("--text-muted", "#94a3b8"); // slate-400
      root.style.setProperty("--border-color", "#475569"); // slate-600
      root.style.setProperty("--accent-color", "#3b82f6"); // blue-500
      root.style.setProperty("--accent-hover", "#2563eb"); // blue-600
      root.style.setProperty("--success-color", "#10b981"); // emerald-500
      root.style.setProperty("--error-color", "#ef4444"); // red-500
      root.style.setProperty("--warning-color", "#f59e0b"); // amber-500
    } else {
      root.classList.remove("dark");
      root.style.setProperty("--bg-primary", "#ffffff"); // white
      root.style.setProperty("--bg-secondary", "#f8fafc"); // slate-50
      root.style.setProperty("--bg-tertiary", "#f1f5f9"); // slate-100
      root.style.setProperty("--text-primary", "#0f172a"); // slate-900
      root.style.setProperty("--text-secondary", "#475569"); // slate-600
      root.style.setProperty("--text-muted", "#64748b"); // slate-500
      root.style.setProperty("--border-color", "#e2e8f0"); // slate-200
      root.style.setProperty("--accent-color", "#3b82f6"); // blue-500
      root.style.setProperty("--accent-hover", "#2563eb"); // blue-600
      root.style.setProperty("--success-color", "#10b981"); // emerald-500
      root.style.setProperty("--error-color", "#ef4444"); // red-500
      root.style.setProperty("--warning-color", "#f59e0b"); // amber-500
    }

    localStorage.setItem("editor-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
