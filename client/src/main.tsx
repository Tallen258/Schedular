import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import { AuthProvider, type AuthProviderProps } from "react-oidc-context";
import { WebStorageStateStore } from "oidc-client-ts";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import App from './App.tsx'

// Create a client
const queryClient = new QueryClient()

const oidcConfig: AuthProviderProps = {
  authority: "https://auth-dev.snowse.io/realms/DevRealm",
  client_id: "taft-chat",
  redirect_uri: window.location.origin + "/auth/callback",
  post_logout_redirect_uri: window.location.origin + "/home",
  scope: "openid profile email",
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  onSigninCallback: () => {
    window.location.replace("/home"); // <— send them to Home after processing
  },
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider {...oidcConfig}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
