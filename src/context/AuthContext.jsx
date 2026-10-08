import React, { createContext, useContext, useState, useCallback } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { isSignedIn, user: clerkUser, isLoaded } = useUser();
  const clerk = useClerk();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authSuccessCallback, setAuthSuccessCallback] = useState(null);

  // Build a normalized user object from Clerk data
  const user = isSignedIn && clerkUser ? {
    id: clerkUser.id,
    userId: clerkUser.id,
    name: clerkUser.fullName || clerkUser.firstName || clerkUser.username || 'Guest',
    customerName: clerkUser.fullName || clerkUser.firstName || clerkUser.username || 'Guest',
    email: clerkUser.primaryEmailAddress?.emailAddress || '',
    phone: clerkUser.primaryPhoneNumber?.phoneNumber?.replace(/^\+91/, '') || '',
    phoneNumber: clerkUser.primaryPhoneNumber?.phoneNumber?.replace(/^\+91/, '') || '',
    avatar: clerkUser.imageUrl || '',
    authProvider: 'clerk',
    authenticatedAt: clerkUser.lastSignInAt?.toISOString() || new Date().toISOString()
  } : null;

  const isAuthenticated = Boolean(isSignedIn && clerkUser);

  const openAuth = useCallback((onSuccess = null) => {
    if (isAuthenticated) {
      // Already signed in, invoke callback immediately
      if (typeof onSuccess === 'function') onSuccess(user);
      return;
    }
    setAuthSuccessCallback(() => onSuccess);
    setIsAuthOpen(true);
  }, [isAuthenticated, user]);

  const closeAuth = useCallback(() => {
    setIsAuthOpen(false);
    setAuthSuccessCallback(null);
  }, []);

  // Called after Clerk sign-in completes (from AuthModal)
  const handleClerkAuthComplete = useCallback(() => {
    setIsAuthOpen(false);
    if (typeof authSuccessCallback === 'function') {
      // Small delay to let Clerk state propagate
      setTimeout(() => {
        authSuccessCallback(user);
        setAuthSuccessCallback(null);
      }, 300);
    }
  }, [authSuccessCallback, user]);

  const logout = useCallback(async () => {
    try {
      await clerk.signOut();
    } catch (e) {
      console.warn('Clerk sign-out error:', e);
    }
  }, [clerk]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoaded,
        isAuthOpen,
        openAuth,
        closeAuth,
        handleClerkAuthComplete,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
