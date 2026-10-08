import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Coffee, ArrowRight, ShieldCheck, RefreshCw, X, ArrowLeft, Smartphone } from 'lucide-react';

export default function AuthModal() {
  const { isAuthOpen, closeAuth, sendPhoneOtp, verifyPhoneOtp, loginWithGoogle } = useAuth();

  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [devHint, setDevHint] = useState('');

  const otpInputRefs = useRef([]);

  // Timer for Resend OTP
  useEffect(() => {
    let interval = null;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Reset state when opening/closing
  useEffect(() => {
    if (!isAuthOpen) {
      setStep('phone');
      setError('');
      setDevHint('');
      setOtpDigits(['', '', '', '', '', '']);
      setResendTimer(30);
      setCanResend(false);
    }
  }, [isAuthOpen]);

  if (!isAuthOpen) return null;

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(val);
    setError('');
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await sendPhoneOtp(phoneNumber);
      setStep('otp');
      setResendTimer(30);
      setCanResend(false);
      if (res.devHint) {
        setDevHint(res.devHint);
      }
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const val = value.replace(/\D/g, '').slice(-1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = val;
    setOtpDigits(nextDigits);
    setError('');

    // Auto-advance
    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter the full 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await verifyPhoneOtp(phoneNumber, fullOtp, customerName);
      // Auto-closes on success via AuthContext callback
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (!canResend || loading) return;
    setOtpDigits(['', '', '', '', '', '']);
    handleSendOtp();
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign-in could not be completed.');
    } finally {
      setLoading(false);
    }
  };

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
        className="auth-modal-card"
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

        {error && (
          <div className="auth-error-banner" role="alert">
            <span>{error}</span>
          </div>
        )}

        {step === 'phone' ? (
          <div className="auth-body-content">
            {/* Google OAuth Option */}
            <div className="auth-oauth-section">
              <button
                type="button"
                className="btn-google-auth"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="auth-divider">
              <span>OR</span>
            </div>

            {/* Phone Login Form */}
            <form onSubmit={handleSendOtp} className="auth-phone-form" noValidate>
              <div className="auth-form-group">
                <label htmlFor="auth-phone">Mobile Number</label>
                <div className="phone-input-wrapper">
                  <span className="phone-country-code">+91</span>
                  <input
                    id="auth-phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="Enter 10-digit number"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    maxLength={10}
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>

              <div className="auth-form-group">
                <label htmlFor="auth-name">Your Name (Optional)</label>
                <input
                  id="auth-name"
                  type="text"
                  placeholder="What should we call you?"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="button button--primary btn-auth-submit"
                disabled={loading || phoneNumber.length !== 10}
              >
                {loading ? (
                  <RefreshCw size={17} className="spin-anim" />
                ) : (
                  <>
                    <span>Send OTP</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <p className="auth-secure-note">
              <ShieldCheck size={14} /> Quick & secure sign-in to order & track coffee.
            </p>
          </div>
        ) : (
          <div className="auth-body-content auth-body-content--otp">
            <button
              type="button"
              className="btn-back-step"
              onClick={() => {
                setStep('phone');
                setError('');
              }}
            >
              <ArrowLeft size={15} /> Change Phone Number
            </button>

            <div className="otp-intro-text">
              <h3>Verify your phone</h3>
              <p>
                We sent a 6-digit OTP to{' '}
                <strong>+91 {phoneNumber.slice(0, 5)} {phoneNumber.slice(5)}</strong>
              </p>
            </div>

            {devHint && (
              <div className="auth-dev-hint">
                <small>Demo OTP Code: <strong>{devHint}</strong> (or 123456)</small>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="auth-otp-form" noValidate>
              <div className="otp-inputs-row" aria-label="Enter 6-digit OTP">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => (otpInputRefs.current[idx] = el)}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleKeyDown(idx, e)}
                    className={`otp-digit-box ${digit ? 'is-filled' : ''}`}
                    aria-label={`Digit ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="submit"
                className="button button--primary btn-auth-submit"
                disabled={loading || otpDigits.join('').length !== 6}
              >
                {loading ? (
                  <RefreshCw size={17} className="spin-anim" />
                ) : (
                  <>
                    <span>Verify OTP</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <div className="otp-resend-row">
              {canResend ? (
                <button
                  type="button"
                  className="btn-resend-otp"
                  onClick={handleResend}
                  disabled={loading}
                >
                  Resend OTP
                </button>
              ) : (
                <span className="resend-countdown-text">
                  Resend OTP in <strong>{resendTimer}s</strong>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
