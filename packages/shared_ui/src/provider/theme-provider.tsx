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
  const [darkTheme, setDarkTheme] = useState(
    localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
  );

  const setTheme = () => {
    document.documentElement.classList.toggle(
      "dark",
      localStorage.theme === "dark" ||
        (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  };
  const toggleTheme = (theme?: "light" | "dark") => {
    switch (theme) {
      case "light":
        localStorage.theme = "light";
        applyThemeTransition(() => {
          document.documentElement.classList.toggle("dark", false);
          setDarkTheme(false);
        });
        break;
      case "dark":
        localStorage.theme = "dark";
        applyThemeTransition(() => {
          document.documentElement.classList.toggle("dark", true);
          setDarkTheme(true);
        });
        break;
      default:
        localStorage.removeItem("theme");
        const isDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        applyThemeTransition(() => {
          document.documentElement.classList.toggle("dark", isDark);
          setDarkTheme(isDark);
        });
    }
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
