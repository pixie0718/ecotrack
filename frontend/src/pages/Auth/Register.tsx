import React, { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Leaf, Lock, Mail, User, ServerCrash } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { extractError, isServerSideError } from '@/services/api';
import AuthShowcase from './AuthShowcase';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  username: z
    .string()
    .min(3, 'At least 3 characters')
    .max(30, 'Max 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Letters, numbers, _ and - only'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'One uppercase letter')
    .regex(/[a-z]/, 'One lowercase letter')
    .regex(/[0-9]/, 'One number')
    .regex(/[^A-Za-z0-9]/, 'One special character'),
  confirmPassword: z.string(),
  firstName: z.string().optional(),
  lastName:  z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;

const BG_PARTICLES = [
  { id: 0, left: '9%',  size: 2, delay: 0,  dur: 21 },
  { id: 1, left: '22%', size: 3, delay: 6,  dur: 18 },
  { id: 2, left: '40%', size: 2, delay: 10, dur: 24 },
  { id: 3, left: '58%', size: 3, delay: 3,  dur: 20 },
  { id: 4, left: '74%', size: 2, delay: 8,  dur: 16 },
  { id: 5, left: '88%', size: 3, delay: 1,  dur: 23 },
];

const LEAF_PATH = 'M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8z';
const AUTH_LEAVES = [
  { id: 0, left: '4%',  size: 18, delay: 3,  dur: 19, rotate: -20 },
  { id: 1, left: '16%', size: 14, delay: 11, dur: 22, rotate: 45 },
  { id: 2, left: '31%', size: 20, delay: 7,  dur: 17, rotate: -55 },
  { id: 3, left: '49%', size: 16, delay: 16, dur: 20, rotate: 30 },
  { id: 4, left: '65%', size: 22, delay: 2,  dur: 24, rotate: -35 },
  { id: 5, left: '79%', size: 14, delay: 13, dur: 18, rotate: 60 },
  { id: 6, left: '92%', size: 18, delay: 20, dur: 21, rotate: -15 },
  { id: 7, left: '37%', size: 12, delay: 5,  dur: 16, rotate: 75 },
];

const STRENGTH_BAR   = ['', 'bg-red-500', 'bg-amber-400', 'bg-blue-400', 'bg-green-500'];
const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLOR = ['', 'text-red-400', 'text-amber-400', 'text-blue-400', 'text-green-400'];

const Register: React.FC = () => {
  const navigate = useNavigate();
  const setAuth  = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [serverError,  setServerError]  = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const password = watch('password', '');
  const checks = [
    { label: '8+ chars',     ok: password.length >= 8 },
    { label: 'Uppercase',    ok: /[A-Z]/.test(password) },
    { label: 'Number',       ok: /[0-9]/.test(password) },
    { label: 'Special char', ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const strength = checks.filter((c) => c.ok).length;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const r    = el.getBoundingClientRect();
    const rotX = (((e.clientY - r.top)  / r.height) - 0.5) * -8;
    const rotY = (((e.clientX - r.left) / r.width)  - 0.5) *  8;
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

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const result = await authService.register({
        email: data.email, username: data.username, password: data.password,
        firstName: data.firstName, lastName: data.lastName,
      });
      setAuth(result.user, result.tokens);
      toast.success(`Welcome to EcoTrack, ${result.user.username}!`);
      navigate('/dashboard');
    } catch (error) {
      if (isServerSideError(error)) {
        setServerError("We're having trouble reaching our servers. Please wait a moment and try again.");
      } else {
        toast.error(extractError(error));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-bg min-h-screen flex overflow-hidden relative">

      {/* Full-page aurora */}
      <div className="aurora-2 pointer-events-none absolute top-[-15%] right-[-10%] w-[650px] h-[650px] rounded-full"
           style={{ background: 'radial-gradient(circle, #059669, transparent 68%)' }} />
      <div className="aurora-1 pointer-events-none absolute bottom-[-20%] left-[-8%] w-[700px] h-[700px] rounded-full"
           style={{ background: 'radial-gradient(circle, #16a34a, transparent 68%)' }} />
      <div className="aurora-3 pointer-events-none absolute top-[20%] left-[30%] w-[380px] h-[380px] rounded-full"
           style={{ background: 'radial-gradient(circle, #6366f1, transparent 68%)' }} />

      {BG_PARTICLES.map((p) => (
        <div key={p.id} className="auth-particle"
             style={{ left: p.left, width: p.size, height: p.size,
                      animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }} />
      ))}

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

      <div className="pointer-events-none absolute inset-0"
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />

      {/* ── LEFT: Showcase ── */}
      <div className="hidden lg:flex lg:w-1/2 shrink-0 relative z-10 min-h-screen">
        <AuthShowcase />
      </div>

      {/* ── RIGHT: Register form (scrollable on small screens, centered on large) ── */}
      <div className="w-full lg:w-1/2 relative z-10 flex items-center justify-center p-6 overflow-y-auto min-h-screen">
        <div className="w-full max-w-sm py-6">

          {/* Mobile-only logo */}
          <div className="lg:hidden text-center mb-6">
            <div className="auth-logo inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3">
              <Leaf className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Join EcoTrack</h1>
            <p className="text-green-400/50 text-sm mt-1">Start your journey to net zero</p>
          </div>

          {/* 3D Glass card */}
          <div
            ref={cardRef}
            className="auth-card rounded-2xl p-6"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
          >
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-white">Create account</h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Join thousands tracking their carbon impact
              </p>
            </div>

            {serverError && (
              <div className="flex items-start gap-2.5 rounded-xl p-3 mb-4"
                   style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
                <ServerCrash className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-amber-300 text-xs leading-relaxed">{serverError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>

              {/* First + Last */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>First name</label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
                          style={{ color: 'rgba(255,255,255,0.28)' }} />
                    <input type="text" placeholder="John"
                           className="auth-input w-full rounded-xl pl-8 pr-2.5 py-2 text-sm"
                           {...register('firstName')} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Last name</label>
                  <input type="text" placeholder="Doe"
                         className="auth-input w-full rounded-xl px-3 py-2 text-sm"
                         {...register('lastName')} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
                        style={{ color: 'rgba(255,255,255,0.28)' }} />
                  <input type="email" autoComplete="email" placeholder="you@example.com"
                         className="auth-input w-full rounded-xl pl-8 pr-3 py-2 text-sm"
                         {...register('email')} />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Username <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold"
                        style={{ color: 'rgba(255,255,255,0.3)' }}>@</span>
                  <input type="text" placeholder="eco_warrior"
                         className="auth-input w-full rounded-xl pl-7 pr-3 py-2 text-sm"
                         {...register('username')} />
                </div>
                {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
                        style={{ color: 'rgba(255,255,255,0.28)' }} />
                  <input type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                         placeholder="Create a strong password"
                         className="auth-input w-full rounded-xl pl-8 pr-9 py-2 text-sm"
                         {...register('password')} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors"
                          style={{ color: 'rgba(255,255,255,0.3)' }}
                          aria-label="Toggle password">
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}

                {/* Strength meter */}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex gap-1 flex-1">
                        {[1,2,3,4].map((i) => (
                          <div key={i}
                               className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? STRENGTH_BAR[strength] : 'bg-white/10'}`} />
                        ))}
                      </div>
                      <span className={`text-xs font-medium ${STRENGTH_COLOR[strength] || 'text-white/30'}`}>
                        {STRENGTH_LABEL[strength] || ''}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                      {checks.map((c) => (
                        <span key={c.label} className={`text-xs transition-colors ${c.ok ? 'text-green-400' : 'text-white/25'}`}>
                          {c.ok ? '✓' : '○'} {c.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Confirm password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
                        style={{ color: 'rgba(255,255,255,0.28)' }} />
                  <input type="password" autoComplete="new-password" placeholder="Repeat your password"
                         className="auth-input w-full rounded-xl pl-8 pr-3 py-2 text-sm"
                         {...register('confirmPassword')} />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>}
              </div>

              <button type="submit" disabled={isLoading}
                      className="auth-btn w-full py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating account…
                  </span>
                ) : 'Create Account'}
              </button>
            </form>

            <p className="mt-4 text-center text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Already have an account?{' '}
              <Link to="/login" className="text-green-400 font-medium hover:text-green-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <p className="text-center text-xs mt-4" style={{ color: 'rgba(255,255,255,0.15)' }}>
            Built for Google Hack2Skill · Prompt Wars Challenge 3
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
