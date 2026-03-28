import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { AuthProvider } from "react-oidc-context";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { PersistGate } from "redux-persist/integration/react";

import { persistor, store } from "./app/store";
import { cognitoAuthConfig } from "./features/auth/cognitoAuth";
import { router } from "./routes/router";

import "./styles/reset.scss";

const theme = createTheme({
  typography: {
    fontFamily: "var(--app-font-family)",
  },
});


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProvider {...cognitoAuthConfig}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
            <RouterProvider router={router} />
        </ThemeProvider>
        </AuthProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
