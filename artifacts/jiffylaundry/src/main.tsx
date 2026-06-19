import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${basePath}/sw.js`).catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(<App />);
