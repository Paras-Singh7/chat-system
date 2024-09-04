import { CssBaseline, ThemeProvider, useMediaQuery } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import createMuiTheme from "../theme/theme";
import { ColorModeContext } from "../context/DarkModeContext";
import Cookies from 'js-cookie';

interface ToggleColorModeProps {
  children: React.ReactNode;
}

const ToggleColorMode: React.FC<ToggleColorModeProps> = ({ children }) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: light)");
  
  const storedMode = Cookies.get("colorMode") as "light" | "dark" | null;
  const [mode, setMode] = useState<"light" | "dark">(
    storedMode || (prefersDarkMode ? "dark" : "light")
  );

  const toggleColorMode = React.useCallback(() => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  }, []);

  useEffect(() => {
    Cookies.set("colorMode", mode);
  }, [mode]);

  const colorMode = useMemo(() => ({ toggleColorMode }), [toggleColorMode]);

  const theme = React.useMemo(() => createMuiTheme(mode || "light"), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default ToggleColorMode;
