import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

type Props = {
  darkTheme: boolean;
  toggleTheme: (theme?: "light" | "dark") => void;
};
const ThemeContext = createContext<Props>({} as any);
export const useThemeContext = () => useContext(ThemeContext);
const ThemeProvider = ({ children }: PropsWithChildren) => {
  // Temporarily disable dark mode (always use light theme)
  const [darkTheme, setDarkTheme] = useState(false);

  const setTheme = () => {
    document.documentElement.classList.toggle("dark", false);
  };
  const toggleTheme = (_theme?: "light" | "dark") => {
    // Disable switching to dark theme temporarily
    applyThemeTransition(() => {
      document.documentElement.classList.toggle("dark", false);
      setDarkTheme(false);
    });
  };
  useEffect(() => {
    setTheme();
  }, []);
  return (
    <ThemeContext.Provider
      value={{
        toggleTheme,
        darkTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;

function applyThemeTransition(updateTheme: () => void) {
  if ("startViewTransition" in document) {
    document.startViewTransition(updateTheme);
    return;
  }

  updateTheme();
}
