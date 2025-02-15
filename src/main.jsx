import { createRoot } from 'react-dom/client';
import { StoreProvider } from "./Store/Store.jsx";
import App from './App.jsx';
import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <StoreProvider> {/* Ensure StoreProvider wraps App if needed */}
      <App />
    </StoreProvider>
  </HelmetProvider>
);
