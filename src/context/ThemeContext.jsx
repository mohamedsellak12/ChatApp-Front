import { createContext, useContext } from "react";
import useDarkMode from "../hooks/useDarkMode";


const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
