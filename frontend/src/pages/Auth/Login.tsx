import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Leaf, Lock, Mail, ShieldAlert, ServerCrash } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { extractError, isServerSideError } from '@/services/api';
import AuthShowcase from './AuthShowcase';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS   = 30_000;

const schema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
type FormValues = z.infer<typeof schema>;

const BG_PARTICLES = [
  { id: 0,  left: '7%',  size: 3, delay: 0,  dur: 20 },
  { id: 1,  left: '18%', size: 2, delay: 5,  dur: 24 },
  { id: 2,  left: '33%', size: 3, delay: 9,  dur: 17 },
  { id: 3,  left: '50%', size: 2, delay: 2,  dur: 22 },
  { id: 4,  left: '64%', size: 3, delay: 7,  dur: 19 },
  { id: 5,  left: '78%', size: 2, delay: 12, dur: 26 },
  { id: 6,  left: '91%', size: 3, delay: 4,  dur: 18 },
];

const LEAF_PATH = 'M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8z';
const AUTH_LEAVES = [
  { id: 0, left: '5%',  size: 16, delay: 2,  dur: 18, rotate: 30 },
  { id: 1, left: '19%', size: 20, delay: 9,  dur: 22, rotate: -25 },
  { id: 2, left: '36%', size: 14, delay: 15, dur: 16, rotate: 55 },
  { id: 3, left: '52%', size: 22, delay: 4,  dur: 20, rotate: -40 },
  { id: 4, left: '68%', size: 16, delay: 12, dur: 24, rotate: 15 },
  { id: 5, left: '82%', size: 18, delay: 7,  dur: 19, rotate: -60 },
  { id: 6, left: '94%', size: 12, delay: 18, dur: 21, rotate: 70 },
  { id: 7, left: '43%', size: 20, delay: 21, dur: 17, rotate: -30 },
];

const Login: React.FC = () => {
  const navigate = useNavigate();
  const setAuth  = useAuthStore((s) => s.setAuth);
  const [showPassword,   setShowPassword]   = useState(false);
  const [isLoading,      setIsLoading]      = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil,    setLockedUntil]    = useState<number | null>(null);
  const [lockCountdown,  setLockCountdown]  = useState(0);
  const [serverError,    setServerError]    = useState<string | null>(null);
  const cardRef     = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (countdownRef.current) clearInterval(countdownRef.current); }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const r   = el.getBoundingClientRect();
    const rotX = (((e.clientY - r.top)  / r.height) - 0.5) * -10;
    const rotY = (((e.clientX - r.left) / r.width)  - 0.5) *  10;
    el.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = 'transform 0.6s cubic-bezier(0.22,1,0.36,1)';
    el.style.transform  = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
    setTimeout(() => { if (el) el.style.transition = 'transform 0.08s ease'; }, 600);
  }, []);

  const handleMouseEnter = useCallback(() => {
    const el = cardRef.current;
    if (el) el.style.transition = 'transform 0.08s ease';
  }, []);

  const startLockout = useCallback(() => {
    const until = Date.now() + LOCKOUT_MS;
    setLockedUntil(until);
    setLockCountdown(Math.ceil(LOCKOUT_MS / 1000));
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      const rem = Math.ceil((until - Date.now()) / 1000);
      if (rem <= 0) {
        clearInterval(countdownRef.current!);
        setLockedUntil(null);
        setLockCountdown(0);
        setFailedAttempts(0);
      } else {
        setLockCountdown(rem);
      }
    }, 1000);
  }, []);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    if (isLocked) return;
    setIsLoading(true);
    setServerError(null);
    try {
      const result = await authService.login(data);
      setAuth(result.user, result.tokens);
      toast.success(`Welcome back, ${result.user.username}!`);
      navigate('/dashboard');
    } catch (error) {
      if (isServerSideError(error)) {
        // Server/network problem — not the user's fault, don't count as failed attempt
        setServerError("We're having trouble reaching our servers. Please wait a moment and try again.");
      } else {
        // Wrong credentials or other client-side error — count the attempt
        const next = failedAttempts + 1;
        setFailedAttempts(next);
        toast.error(extractError(error));
        if (next >= MAX_ATTEMPTS) startLockout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-bg min-h-screen flex overflow-hidden relative">

      {/* Full-page aurora */}
      <div className="aurora-1 pointer-events-none absolute top-[-15%] left-[-8%] w-[600px] h-[600px] rounded-full"
           style={{ background: 'radial-gradient(circle, #16a34a, transparent 68%)' }} />
      <div className="aurora-2 pointer-events-none absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full"
           style={{ background: 'radial-gradient(circle, #0d9488, transparent 68%)' }} />
      <div className="aurora-3 pointer-events-none absolute top-[40%] right-[30%] w-[400px] h-[400px] rounded-full"
           style={{ background: 'radial-gradient(circle, #3b82f6, transparent 68%)' }} />

      {/* Full-page circle particles */}
      {BG_PARTICLES.map((p) => (
        <div key={p.id} className="auth-particle"
             style={{ left: p.left, width: p.size, height: p.size,
                      animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }} />
      ))}

      {/* Full-page leaf particles */}
      {AUTH_LEAVES.map((leaf) => (
        <svg
          key={`leaf-${leaf.id}`}
          className="auth-leaf"
          width={leaf.size}
          height={leaf.size}
          viewBox="0 0 24 24"
          style={{
            left: leaf.left,
            fill: 'rgba(34,197,94,0.50)',
            transform: `rotate(${leaf.rotate}deg)`,
            animationDuration: `${leaf.dur}s`,
            animationDelay: `${leaf.delay}s`,
          }}
        >
          <path d={LEAF_PATH} />
        </svg>
      ))}

      {/* Grid */}
      <div className="pointer-events-none absolute inset-0"
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />

      {/* ── LEFT: Project showcase (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 shrink-0 relative z-10 min-h-screen">
        <AuthShowcase />
      </div>

      {/* ── RIGHT: Login form ── */}
      <div className="w-full lg:w-1/2 relative z-10 flex items-center justify-center p-6 min-h-screen">
        <div className="w-full max-w-sm">

          {/* Mobile-only logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-block">
              <div className="auth-logo inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3">
                <Leaf className="h-8 w-8 text-white" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-white">EcoTrack</h1>
            <p className="text-green-400/50 text-sm mt-1">Your carbon footprint tracker</p>
          </div>

          {/* 3D Glass card */}
          <div
            ref={cardRef}
            className="auth-card rounded-2xl p-7"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
          >
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">Sign in</h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Continue your eco journey
              </p>
            </div>

            {/* Server-side error banner — kind message, no blame on user */}
            {serverError && !isLocked && (
              <div className="flex items-start gap-2.5 rounded-xl p-3 mb-5"
                   style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
                <ServerCrash className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-amber-300 text-xs leading-relaxed">{serverError}</p>
              </div>
            )}

            {/* Lockout banner — user exceeded attempts */}
            {isLocked && (
              <div className="flex items-center gap-2.5 rounded-xl p-3 mb-5"
                   style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
                <p className="text-red-400 text-sm">
                  Locked — try again in <span className="font-bold">{lockCountdown}s</span>
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                        style={{ color: 'rgba(255,255,255,0.28)' }} />
                  <input type="email" autoComplete="email" placeholder="you@example.com"
                         className="auth-input w-full rounded-xl pl-9 pr-4 py-2.5 text-sm"
                         {...register('email')} />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                        style={{ color: 'rgba(255,255,255,0.28)' }} />
                  <input type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                         placeholder="Enter your password"
                         className="auth-input w-full rounded-xl pl-9 pr-10 py-2.5 text-sm"
                         {...register('password')} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                          style={{ color: 'rgba(255,255,255,0.3)' }}
                          aria-label="Toggle password visibility">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
              </div>

              {failedAttempts > 0 && !isLocked && (
                (() => {
                  const remaining = MAX_ATTEMPTS - failedAttempts;
                  const isLastChance = remaining === 1;
                  return (
                    <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 ${
                      isLastChance
                        ? 'bg-red-500/10 border border-red-500/20'
                        : 'bg-amber-500/10 border border-amber-500/20'
                    }`}>
                      <ShieldAlert className={`h-3 w-3 shrink-0 ${isLastChance ? 'text-red-400' : 'text-amber-400'}`} />
                      <p className={`text-xs font-medium ${isLastChance ? 'text-red-400' : 'text-amber-400/90'}`}>
                        {isLastChance
                          ? 'Last attempt — account will lock for 30s after this'
                          : `${remaining} attempts left before temporary lockout`}
                      </p>
                    </div>
                  );
                })()
              )}

              <button type="submit" disabled={isLoading || isLocked}
                      className="auth-btn w-full py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-1">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : isLocked ? `Locked · ${lockCountdown}s` : 'Sign In'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              No account?{' '}
              <Link to="/register" className="text-green-400 font-medium hover:text-green-300 transition-colors">
                Create one free
              </Link>
            </p>
          </div>

          <p className="text-center text-xs mt-5" style={{ color: 'rgba(255,255,255,0.15)' }}>
            Built for Google Hack2Skill · Prompt Wars Challenge 3
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
