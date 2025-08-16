import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeCacheManagement } from "./utils/cache-management";

// Initialize cache management to prevent stale cache issues
initializeCacheManagement();

createRoot(document.getElementById("root")!).render(<App />);
