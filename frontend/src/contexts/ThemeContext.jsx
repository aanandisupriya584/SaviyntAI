import * as React from "react";
const ThemeContext = React.createContext(null);
const STORAGE_KEY = "saviynt-theme-kpmg";
function getInitialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {}
  return "light";
}
function ThemeProvider({ children }) {
  const [theme, setTheme] = React.useState(getInitialTheme);
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }
  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
export { ThemeContext, STORAGE_KEY, getInitialTheme, ThemeProvider, useTheme };
