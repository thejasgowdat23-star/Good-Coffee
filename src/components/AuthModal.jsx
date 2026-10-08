import React, { useEffect } from 'react';
import { SignIn, useUser } from '@clerk/clerk-react';
import { useAuth } from '../context/AuthContext';
import { X, Coffee } from 'lucide-react';

export default function AuthModal() {
  const { isAuthOpen, closeAuth, handleClerkAuthComplete } = useAuth();
  const { isSignedIn } = useUser();

  // When user signs in via Clerk, auto-close modal and fire callback
  useEffect(() => {
    if (isAuthOpen && isSignedIn) {
      handleClerkAuthComplete();
    }
  }, [isSignedIn, isAuthOpen, handleClerkAuthComplete]);

  if (!isAuthOpen) return null;

  return (
    <div className="auth-overlay" onClick={closeAuth}>
      {/* Coffee-Shop Atmosphere Full-Screen Backdrop */}
      <div className="auth-backdrop-media" aria-hidden="true">
        <img
          src="/images/hero-desktop.webp"
          alt="Freshly brewed coffee atmosphere"
          className="auth-backdrop-img"
        />
        <div className="auth-backdrop-overlay" />
      </div>

      <div
        className="auth-modal-card auth-modal-card--clerk"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Good Day Coffee Authentication"
      >
        <button
          type="button"
          className="auth-modal-close"
          onClick={closeAuth}
          aria-label="Close authentication"
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <header className="auth-card-header">
          <div className="auth-brand-badge">
            <Coffee size={22} className="auth-coffee-icon" />
          </div>
          <h2>Good Day Coffee</h2>
          <p className="auth-tagline">Your good day starts here.</p>
        </header>

        {/* Clerk Sign-In Component */}
        <div className="clerk-sign-in-container">
          <SignIn
            routing="hash"
            signUpUrl=""
            appearance={{
              elements: {
                rootBox: 'clerk-root-box',
                card: 'clerk-card-override',
                headerTitle: 'clerk-hidden',
                headerSubtitle: 'clerk-hidden',
                socialButtonsBlockButton: 'clerk-social-btn',
                formButtonPrimary: 'clerk-primary-btn',
                formFieldInput: 'clerk-input',
                footerAction: 'clerk-footer',
                dividerRow: 'clerk-divider',
                identityPreview: 'clerk-identity-preview',
                formFieldLabel: 'clerk-label',
                alert: 'clerk-alert',
                otpCodeFieldInput: 'clerk-otp-input'
              },
              variables: {
                colorPrimary: '#e4572e',
                colorText: '#2b1810',
                colorTextSecondary: '#7a6254',
                colorBackground: 'transparent',
                colorInputBackground: '#ffffff',
                colorInputText: '#2b1810',
                borderRadius: '12px',
                fontFamily: 'inherit'
              },
              layout: {
                socialButtonsPlacement: 'top',
                showOptionalFields: false
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
