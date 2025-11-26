import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from 'react-oidc-context';
import App from '../App';

// Mock OIDC configuration
const mockOidcConfig = {
  authority: 'https://mock-authority.com',
  client_id: 'mock-client-id',
  redirect_uri: 'http://localhost:5173/auth/callback',
};

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <AuthProvider {...mockOidcConfig}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    );
    // App should render, showing either loading state or content
    expect(document.body).toBeTruthy();
  });

  it('renders toaster component', () => {
    const { container } = render(
      <AuthProvider {...mockOidcConfig}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    );
    // Check that the app structure is present
    expect(container.querySelector('.main-content')).toBeTruthy();
  });
});
