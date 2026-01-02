import { createAuthClient } from 'better-auth/client';

// Client Better-Auth vanilla (pas React)
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

// Export des méthodes
export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = authClient.signOut;
export const getSession = authClient.getSession;
