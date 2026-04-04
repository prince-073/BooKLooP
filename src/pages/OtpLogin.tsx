import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequestOtp, apiVerifyOtp } from '../lib/api';
import { clearToken, setCurrentUser, setToken } from '../lib/auth';
import { cn } from '../lib/utils';
import { BookOpen } from 'lucide-react';

type Mode = 'register' | 'login';
type Step = 'request' | 'verify';

export function OtpLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('register');
  const [step, setStep] = useState<Step>('request');

  const [email, setEmail] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [code, setCode] = useState('');

  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [role, setRole] = useState('Student');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canRequest = useMemo(() => {
    const trimmed = email.trim();
    if (!trimmed.includes('@') || !trimmed.includes('.') || trimmed.length < 5) return false;
    if (mode === 'register') return name.trim().length >= 1 && course.trim().length >= 1 && year.trim().length >= 1;
    return true;
  }, [email, mode, name, course, year]);

  const canVerify = useMemo(() => {
    return code.trim().length >= 4;
  }, [code]);

  function resetForm() {
    setStep('request');
    setCode('');
    setDevOtp(null);
    setError(null);
  }

  async function handleRequestOtp() {
    setLoading(true);
    setError(null);
    try {
      clearToken();
      const data = await apiRequestOtp(email.trim());
      setDevOtp(typeof data?.otp === 'string' ? data.otp : (data?.otp != null ? String(data.otp) : null));
      setStep('verify');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setLoading(true);
    setError(null);
    try {
      const payload: { email: string; code: string; name?: string; course?: string; year?: string; phone?: string; role?: string; } = {
        email: email.trim(),
        code: code.trim(),
      };
      if (mode === 'register') {
        payload.name = name.trim();
        payload.course = course.trim();
        payload.year = year.trim();
        payload.role = role.trim();
        if (phone.trim()) payload.phone = phone.trim();
      }

      const data = await apiVerifyOtp(payload);

      const token = data?.token as string | undefined;
      if (!token) throw new Error('No token returned.');

      setToken(token);
      if (data?.user) setCurrentUser(data.user);
      navigate('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  const inputClasses = "w-full bg-surface-bright/60 dark:bg-surface/50 backdrop-blur-sm border border-outline-variant/60 focus:border-primary/60 text-on-surface text-base py-3.5 px-5 rounded-2xl focus:ring-4 focus:ring-primary/15 transition-all outline-none placeholder:text-on-surface-variant/40 mb-4 shadow-sm";
  const labelClasses = "block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 ml-1";

  return (
    <div className="relative min-h-screen bg-background flex flex-col items-center justify-center px-4 sm:px-6 py-12 overflow-hidden">
      
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-primary-fixed opacity-30 blur-[100px] mix-blend-multiply dark:mix-blend-screen rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-secondary-fixed opacity-30 blur-[100px] mix-blend-multiply dark:mix-blend-screen rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-[520px] bg-surface-container-lowest/80 dark:bg-surface-container/60 backdrop-blur-xl border border-outline-variant/40 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-8 sm:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center mb-4 shadow-md border border-outline-variant/20">
            <BookOpen size={28} className="text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-headline font-extrabold tracking-tight text-on-surface bg-clip-text text-transparent bg-gradient-to-r from-on-surface to-on-surface-variant">Campus Book Exchange</h1>
          <p className="text-sm font-body text-on-surface-variant mt-2 font-medium">Secure sign in with Email OTP.</p>
        </div>

        {/* Register / Login tabs */}
        <div className="flex bg-surface-container-high/40 p-1.5 rounded-2xl mb-8 backdrop-blur-md shadow-inner border border-outline-variant/30">
          <button
            onClick={() => { setMode('register'); resetForm(); }}
            className={cn(
              "flex-1 py-3 text-xs font-bold rounded-xl transition-all uppercase tracking-widest",
              mode === 'register' ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50"
            )}
          >
            Register
          </button>
          <button
            onClick={() => { setMode('login'); resetForm(); }}
            className={cn(
              "flex-1 py-3 text-xs font-bold rounded-xl transition-all uppercase tracking-widest",
              mode === 'login' ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50"
            )}
          >
            Login
          </button>
        </div>

        {step === 'request' ? (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <label className={labelClasses}>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              className={inputClasses}
            />

            {mode === 'register' && (
              <>
                <label className={labelClasses}>Full Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Julian Thorne"
                  className={inputClasses}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className={cn(inputClasses, "appearance-none cursor-pointer")}
                    >
                      <option value="Student">Student</option>
                      <option value="Faculty">Faculty</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClasses}>Course / Dept</label>
                    <input
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      placeholder="e.g. Comp Sci"
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>Current Year</label>
                    <input
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="e.g. 1, 2, 3, 4"
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Phone (optional)</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className={inputClasses}
                    />
                  </div>
                </div>
              </>
            )}

            <button
              disabled={!canRequest || loading}
              onClick={handleRequestOtp}
              className="w-full mt-2 bg-gradient-to-r from-primary to-primary-fixed-dim text-white font-bold py-4 rounded-[1.25rem] text-sm uppercase tracking-widest hover:opacity-95 hover:shadow-lg transition-all active:scale-[0.98] shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending OTP...' : mode === 'register' ? 'Register & Send OTP' : 'Send OTP via Email'}
            </button>

            <div className="mt-8 pt-6 border-t border-outline-variant/30 text-center">
              <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                {mode === 'register'
                  ? 'We use OTP for seamless un-phishable verification.'
                  : 'New to the campus exchange? Switch to Register above.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            {devOtp && (
              <div className="mb-8 p-6 bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-400/40 rounded-[1.5rem] shadow-sm flex flex-col items-center text-center">
                <p className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold mb-2">Development Mode OTP Captured</p>
                <p className="text-4xl font-headline font-black text-emerald-700 dark:text-emerald-300 tracking-[0.2em] mb-3">{devOtp}</p>
                <p className="text-xs font-medium text-emerald-600/80 dark:text-emerald-400/80 max-w-xs">(In production, this is emailed securely to your address.)</p>
              </div>
            )}

            {!devOtp && (
              <div className="mb-8 p-5 bg-tertiary-container/30 border border-tertiary/20 rounded-[1.5rem] text-center">
                <p className="text-sm font-medium text-on-surface-variant">
                  We sent a 6-digit code to <br/><span className="text-on-surface font-bold mt-1 inline-block">{email}</span>
                </p>
                <p className="text-[11px] text-tertiary font-bold mt-3 uppercase tracking-wider">
                  Check your spam/junk folder
                </p>
              </div>
            )}

            <label className={cn(labelClasses, "text-center")}>Enter Verification Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="• • • • • •"
              inputMode="numeric"
              className={cn(inputClasses, "text-center text-2xl tracking-[0.3em] font-black placeholder:text-2xl placeholder:tracking-normal placeholder:font-medium py-5")}
              maxLength={6}
            />

            <button
              disabled={!canVerify || loading}
              onClick={handleVerifyOtp}
              className="w-full mt-4 bg-gradient-to-r from-primary to-primary-fixed-dim text-white font-bold py-4 rounded-[1.25rem] text-sm uppercase tracking-widest hover:opacity-95 hover:shadow-lg transition-all active:scale-[0.98] shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : mode === 'register' ? 'Complete Registration' : 'Verify & Sign In'}
            </button>

            <div className="mt-8 pt-6 border-t border-outline-variant/30">
              <button
                disabled={loading}
                onClick={resetForm}
                className="w-full py-3.5 text-on-surface-variant font-bold rounded-[1.25rem] text-xs uppercase tracking-widest hover:bg-surface-variant/40 hover:text-on-surface transition-all border border-outline-variant/40 disabled:opacity-50"
              >
                Change Email / Resend
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-error-container/50 border border-error/30 rounded-2xl flex items-start gap-3 animate-in fade-in duration-300">
             <div className="p-1 bg-error/10 rounded-full shrink-0"><BookOpen size={16} className="text-error" /></div>
             <p className="text-sm font-medium text-error flex-1">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
