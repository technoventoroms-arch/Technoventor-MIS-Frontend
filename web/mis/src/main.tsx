import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./premium/sentry";
import App from "./App.tsx";

// Recover from stale hashed chunk/CSS references after a new deploy.
window.addEventListener("vite:preloadError", () => {
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
