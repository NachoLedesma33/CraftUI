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
      root.classList.remove("light");
      root.style.setProperty("--bg-primary", "#1a1a1a");
      root.style.setProperty("--bg-secondary", "#252525");
      root.style.setProperty("--bg-tertiary", "#2e2e2e");
      root.style.setProperty("--surface", "#222222");
      root.style.setProperty("--text", "#f0ece4");
      root.style.setProperty("--text-secondary", "#a09a8f");
      root.style.setProperty("--text-muted", "#7a756a");
      root.style.setProperty("--border", "#000000");
      root.style.setProperty("--accent", "#fbbf24");
      root.style.setProperty("--accent-alt", "#22d3ee");
      root.style.setProperty("--selection", "rgba(251, 191, 36, 0.3)");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      root.style.setProperty("--bg-primary", "#f5f0eb");
      root.style.setProperty("--bg-secondary", "#fffef5");
      root.style.setProperty("--bg-tertiary", "#e8e2d8");
      root.style.setProperty("--surface", "#ffffff");
      root.style.setProperty("--text", "#1a1a1a");
      root.style.setProperty("--text-secondary", "#6b6560");
      root.style.setProperty("--text-muted", "#8a847a");
      root.style.setProperty("--border", "#000000");
      root.style.setProperty("--accent", "#ef4444");
      root.style.setProperty("--accent-alt", "#3b82f6");
      root.style.setProperty("--selection", "rgba(239, 68, 68, 0.2)");
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

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
