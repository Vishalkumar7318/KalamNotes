import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  Mail,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  BookOpen,
  Lock,
  User,
  KeyRound,
  X,
} from 'lucide-react';
import { UserProfile } from '../types';
import { signInWithGoogle } from '../firebase';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onCancel,
  isModal = false,
}) => {
  const [authMode, setAuthMode] = useState<'mobile' | 'email'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [userName, setUserName] = useState('');
  const [step, setStep] = useState<'input' | 'otp'>('input');

  // Google Firebase Auth State
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  // OTP State: 6 digits
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState<number>(60);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [demoOtpNotice, setDemoOtpNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Google Sign-In with Firebase Auth handler
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    try {
      const fbUser = await signInWithGoogle();
      const userProfile: UserProfile = {
        id: fbUser.uid,
        loginType: 'email',
        identifier: fbUser.email || fbUser.displayName || 'Google User',
        name: fbUser.displayName || 'Student',
        avatarColor: '#4285F4',
        createdAt: Date.now(),
      };
      setSuccessMessage(`Google से सफलतापूर्वक लॉगिन हो गया: ${userProfile.name}`);
      try {
        localStorage.setItem('kalamnotes_user', JSON.stringify(userProfile));
      } catch (e) {}

      setTimeout(() => {
        onLoginSuccess(userProfile);
      }, 500);
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('लॉगिन विंडो बंद कर दी गई। कृपया पुनः प्रयास करें।');
      } else {
        setErrorMessage(err.message || 'Google साइन-इन विफल रहा।');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Countdown timer for Resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const currentIdentifier =
    authMode === 'mobile'
      ? `+91 ${mobileNumber.replace(/\D/g, '')}`
      : emailAddress.trim().toLowerCase();

  // Step 1: Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanNumber = mobileNumber.replace(/\D/g, '');
    if (authMode === 'mobile' && cleanNumber.length < 10) {
      setErrorMessage('कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें (e.g. 9876543210)');
      return;
    }

    if (authMode === 'email' && (!emailAddress.includes('@') || !emailAddress.includes('.'))) {
      setErrorMessage('कृपया एक वैध Gmail / Email पता दर्ज करें (e.g. yourname@gmail.com)');
      return;
    }

    setIsSendingOtp(true);
    try {
      const payload = {
        identifier: authMode === 'mobile' ? cleanNumber : emailAddress.trim(),
        type: authMode,
      };

      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'OTP भेजने में विफल रहे');
      }

      setStep('otp');
      setResendTimer(60);
      setOtpDigits(['', '', '', '', '', '']);

      if (data.otpDemo) {
        setDemoOtpNotice(data.otpDemo);
      }

      setSuccessMessage(`सफलतापूर्वक 6-अंकों का OTP भेजा गया: ${currentIdentifier}`);

      // Focus first OTP input box after render
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setErrorMessage(err.message || 'OTP भेजने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Quick fill demo OTP
  const handleQuickFillOtp = () => {
    if (!demoOtpNotice) return;
    const digits = demoOtpNotice.split('').slice(0, 6);
    setOtpDigits(digits);
    setErrorMessage(null);
  };

  // Handle digit change in 6-box input
  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);
    setErrorMessage(null);

    // Auto advance focus to next box
    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation in OTP boxes
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Handle paste full 6-digit code
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const updated = [...otpDigits];
    for (let i = 0; i < pasteData.length; i++) {
      updated[i] = pasteData[i];
    }
    setOtpDigits(updated);

    const nextFocus = Math.min(pasteData.length, 5);
    otpInputsRef.current[nextFocus]?.focus();
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      setErrorMessage('कृपया सभी 6 अंकों का OTP दर्ज करें');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const cleanNumber = mobileNumber.replace(/\D/g, '');
      const payload = {
        identifier: authMode === 'mobile' ? cleanNumber : emailAddress.trim(),
        otp: fullOtp,
        name: userName.trim() || undefined,
        type: authMode,
      };

      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'अमान्य OTP कोड। कृपया पुनः प्रयास करें।');
      }

      setSuccessMessage('सफलतापूर्वक लॉगिन हो गया! KalamNotes में आपका स्वागत है।');

      // Persist in localStorage
      try {
        localStorage.setItem('kalamnotes_user', JSON.stringify(data.user));
      } catch (e) {}

      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'OTP सत्यापन विफल रहा।');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div
      className={
        isModal
          ? 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto'
          : 'w-full max-w-xl mx-auto my-6 px-3 sm:px-4'
      }
    >
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden text-stone-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Glow ambient background effect */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button if Modal or onCancel provided */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 rounded-xl transition-colors cursor-pointer z-20"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header Section */}
        <div className="relative z-10 p-5 sm:p-6 pb-4 border-b border-stone-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-stone-950 flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              ✍️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                  KalamNotes Login
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  Secure OTP
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                नंबर या Gmail से 1-टैप में OTP लॉगिन करें और अपने नोट्स सुरक्षित रखें
              </p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="relative z-10 p-5 sm:p-6 space-y-4">
          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950/70 border border-red-800/80 text-red-200 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-200 text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* Demo OTP Instant Testing Pill */}
          {demoOtpNotice && step === 'otp' && (
            <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex flex-wrap items-center justify-between gap-2 shadow-inner">
              <div className="flex items-center gap-2">
                <span className="text-base">📩</span>
                <div>
                  <span className="text-stone-300">Your Verification Code:</span>{' '}
                  <strong className="text-amber-400 text-sm tracking-wider font-mono bg-stone-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                    {demoOtpNotice}
                  </strong>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickFillOtp}
                className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 text-[11px] font-bold rounded-lg transition-all cursor-pointer shadow-sm hover:scale-105"
              >
                ⚡ Quick Fill OTP
              </button>
            </div>
          )}

          {/* STEP 1: INPUT IDENTIFIER (MOBILE OR GMAIL) */}
          {step === 'input' && (
            <div className="space-y-4">
              {/* Google Sign-in with Firebase Auth */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isSendingOtp}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-60 border border-stone-200"
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-stone-900" />
                      <span>Connecting with Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.12C3.3 21.44 7.37 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.59H1.27C.46 8.2.005 10.05.005 12s.455 3.8 1.265 5.41l4.01-3.12z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.3 2.56 1.27 6.59l4.01 3.12c.95-2.83 3.6-4.96 6.72-4.96z"
                        />
                      </svg>
                      <span>Continue with Google (Google Sign-In)</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-800 font-bold border border-amber-500/30">
                        Firebase
                      </span>
                    </>
                  )}
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-stone-800 w-full" />
                  <span className="bg-stone-900 px-3 text-[11px] font-semibold text-stone-500 uppercase tracking-wider shrink-0">
                    Or login with OTP verification
                  </span>
                  <div className="border-t border-stone-800 w-full" />
                </div>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Method Switcher Tabs */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
                  Choose Login Method:
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-stone-950 rounded-xl border border-stone-800">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('mobile');
                      setErrorMessage(null);
                    }}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      authMode === 'mobile'
                        ? 'bg-amber-400 text-stone-950 shadow-sm'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Mobile Number</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('email');
                      setErrorMessage(null);
                    }}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      authMode === 'email'
                        ? 'bg-amber-400 text-stone-950 shadow-sm'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Gmail / Email</span>
                  </button>
                </div>
              </div>

              {/* Mobile Number Input */}
              {authMode === 'mobile' ? (
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center justify-between">
                    <span>Mobile Phone Number</span>
                    <span className="text-[10px] text-stone-500">10-Digit Mobile</span>
                  </label>
                  <div className="flex items-center rounded-xl bg-stone-950 border border-stone-700/80 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all overflow-hidden">
                    <div className="px-3 py-2.5 bg-stone-900 border-r border-stone-800 text-stone-300 text-xs font-bold flex items-center gap-1.5 shrink-0 select-none">
                      <span>🇮🇳 +91</span>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="98765 43210"
                      maxLength={12}
                      autoFocus
                      required
                      className="w-full px-3.5 py-2.5 bg-transparent text-stone-100 placeholder-stone-500 text-sm focus:outline-none tracking-wider font-mono font-medium"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Enter any 10-digit number to receive a 6-digit verification code.
                  </p>
                </div>
              ) : (
                /* Gmail / Email Input */
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center justify-between">
                    <span>Gmail / Google Email Address</span>
                    <span className="text-[10px] text-stone-500">Fast Sign-In</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="yourname@gmail.com"
                      autoFocus
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 bg-stone-950 border border-stone-700/80 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                  {/* Quick Domain Suggestion Chips */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[10px] text-stone-500">Quick add:</span>
                    {['@gmail.com', '@yahoo.com', '@outlook.com'].map((domain) => (
                      <button
                        key={domain}
                        type="button"
                        onClick={() => {
                          const base = emailAddress.split('@')[0] || 'student';
                          setEmailAddress(base + domain);
                        }}
                        className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-mono transition-colors cursor-pointer"
                      >
                        {domain}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Name Input for Cover Page */}
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center justify-between">
                  <span>Student / User Name (Optional)</span>
                  <span className="text-[10px] text-stone-500">Printed on notes</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Vishal Kumar, Aman, Priya..."
                    className="w-full pl-10 pr-3.5 py-2.5 bg-stone-950 border border-stone-700/80 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSendingOtp}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                    <span>OTP भेजा जा रहा है...</span>
                  </>
                ) : (
                  <>
                    <span>Get Verification OTP (OTP प्राप्त करें)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

          {/* STEP 2: VERIFY 6-DIGIT OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-1">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Enter 6-Digit OTP Code</h3>
                <p className="text-xs text-stone-400">
                  हमने सत्यापन कोड भेजा है:{' '}
                  <span className="font-semibold text-amber-300 font-mono">{currentIdentifier}</span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep('input');
                    setErrorMessage(null);
                    setDemoOtpNotice(null);
                  }}
                  className="text-[11px] text-amber-400 hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Change number or email (नंबर बदलें)</span>
                </button>
              </div>

              {/* 6 Digit Input Boxes */}
              <div className="flex justify-center gap-2 sm:gap-3 py-2">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpInputsRef.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono rounded-xl bg-stone-950 border border-stone-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 text-white focus:outline-none transition-all shadow-inner"
                  />
                ))}
              </div>

              {/* Verify OTP Button */}
              <button
                type="submit"
                disabled={isVerifyingOtp || otpDigits.join('').length < 6}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                {isVerifyingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                    <span>सत्यापित हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Continue (सत्यापित करें)</span>
                  </>
                )}
              </button>

              {/* Resend Timer & Button */}
              <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
                <span>Didn't receive the OTP?</span>
                {resendTimer > 0 ? (
                  <span className="text-stone-500 font-mono">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={isSendingOtp}
                    className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend OTP Now</span>
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Guest Mode Option */}
          {onCancel && (
            <div className="pt-2 border-t border-stone-800/80 text-center">
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-stone-400 hover:text-stone-200 hover:underline cursor-pointer"
              >
                Skip for now & Continue as Guest →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
