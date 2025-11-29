import React, { lazy, Suspense, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "./components/ui/provider";

// Lazy load Analytics to reduce initial bundle size
const Analytics = lazy(() => import("@vercel/analytics/react").then(module => ({ default: module.Analytics })));

// Defer Analytics loading until after initial render
function DeferredAnalytics() {
  const [shouldLoad, setShouldLoad] = React.useState(false);

  useEffect(() => {
    // Load Analytics after page is interactive
    const timer = setTimeout(() => setShouldLoad(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!shouldLoad) return null;

  return (
    <Suspense fallback={null}>
      <Analytics />
    </Suspense>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider>
      <App />
    </Provider>
    <DeferredAnalytics />
  </React.StrictMode>,
);
