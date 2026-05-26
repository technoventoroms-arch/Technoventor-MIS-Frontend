import { Toaster } from "@mono/shared_ui/components/ui/sonner";
import "@mono/shared_ui/index.css";
import ThemeProvider from "@mono/shared_ui/provider/theme-provider";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./premium/auth";
import browserRouter from "./routes";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider router={browserRouter} />
        <Toaster richColors />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
