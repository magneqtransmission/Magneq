import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import {ThemeProvider} from "./context/ThemeContext.jsx";
import {Provider} from "react-redux";
import {PersistGate} from "redux-persist/integration/react";
import store, {persistor} from "./store/store.js";
import "./index.css";
import App from "./App.jsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import { SearchProvider } from '../src/context/SearchbarContext.jsx';
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider>
            <QueryClientProvider client={queryClient}>
              <SearchProvider>
                <App />
                <Toaster
                  position="top-center"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                      zIndex: 999999,
                    },
                    success: {
                      duration: 3000,
                      theme: {
                        primary: '#4aed88',
                      },
                    },
                    error: {
                      duration: 4000,
                      theme: {
                        primary: '#ff4b4b',
                      },
                    },
                  }}
                  containerStyle={{
                    top: 100,
                    right: 20,
                    zIndex: 999999,
                  }}
                />
              </SearchProvider>
            </QueryClientProvider>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </BrowserRouter>
  </StrictMode>
);
