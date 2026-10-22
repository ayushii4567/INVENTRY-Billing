import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Dynamic API interceptor: routes to VITE_API_URL or relative /api when deployed live
const customApiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const originalFetch = window.fetch;
window.fetch = function (url, options = {}) {
  let targetUrl = url;
  if (typeof targetUrl === "string" && targetUrl.startsWith("http://localhost:5005")) {
    if (customApiUrl) {
      targetUrl = targetUrl.replace("http://localhost:5005", customApiUrl);
    } else if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      targetUrl = targetUrl.replace("http://localhost:5005", "");
    }
  }

  // Auto-inject Authorization token if not provided
  try {
    const token = localStorage.getItem("erp_token") || localStorage.getItem("distributor_token");
    if (token && typeof targetUrl === "string" && !targetUrl.includes("/api/auth/login")) {
      const opts = { ...options };
      const headers = new Headers(opts.headers || {});
      if (!headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
        opts.headers = headers;
        return originalFetch.call(this, targetUrl, opts);
      }
    }
  } catch (e) {
    // ignore localStorage access errors
  }

  return originalFetch.call(this, targetUrl, options);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
