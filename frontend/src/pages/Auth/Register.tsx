import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Leaf, Lock, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { extractError } from '@/services/api';

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
  lastName: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const password = watch('password', '');
  const strengthChecks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
    { label: 'Special char', ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const strength = strengthChecks.filter((c) => c.ok).length;

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const result = await authService.register({
        email: data.email,
        username: data.username,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      setAuth(result.user, result.tokens);
      toast.success(`Welcome to EcoTrack, ${result.user.username}! 🌱`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(extractError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-carbon-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
            <Leaf className="h-9 w-9 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-carbon-900">Join EcoTrack</h1>
          <p className="text-carbon-500 mt-1">Start your journey to net zero</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-carbon-100">
          <h2 className="text-xl font-semibold text-carbon-900 mb-6">Create your account</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                placeholder="John"
                leftElement={<User className="h-4 w-4" />}
                {...register('firstName')}
              />
              <Input
                label="Last name"
                placeholder="Doe"
                {...register('lastName')}
              />
            </div>

            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              leftElement={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <Input
              label="Username"
              placeholder="eco_warrior"
              leftElement={<span className="text-carbon-400 text-sm">@</span>}
              error={errors.username?.message}
              required
              {...register('username')}
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Create a strong password"
                leftElement={<Lock className="h-4 w-4" />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-carbon-400 hover:text-carbon-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={errors.password?.message}
                required
                {...register('password')}
              />
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= strength
                            ? strength <= 1 ? 'bg-red-400' : strength <= 2 ? 'bg-yellow-400' : strength <= 3 ? 'bg-blue-400' : 'bg-green-500'
                            : 'bg-carbon-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {strengthChecks.map((check) => (
                      <span key={check.label} className={`text-xs ${check.ok ? 'text-green-600' : 'text-carbon-400'}`}>
                        {check.ok ? '✓' : '○'} {check.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              leftElement={<Lock className="h-4 w-4" />}
              error={errors.confirmPassword?.message}
              required
              {...register('confirmPassword')}
            />

            <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-carbon-500">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 font-medium hover:text-green-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
