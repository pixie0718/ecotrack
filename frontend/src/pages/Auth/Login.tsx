import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Leaf, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { extractError } from '@/services/api';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const result = await authService.login(data);
      setAuth(result.user, result.tokens);
      toast.success(`Welcome back, ${result.user.username}! 🌱`);
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
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
            <Leaf className="h-9 w-9 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-carbon-900">EcoTrack</h1>
          <p className="text-carbon-500 mt-1">Your personal carbon footprint tracker</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-carbon-100">
          <h2 className="text-xl font-semibold text-carbon-900 mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              leftElement={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              leftElement={<Lock className="h-4 w-4" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-carbon-400 hover:text-carbon-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={errors.password?.message}
              required
              {...register('password')}
            />

            <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-carbon-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-green-600 font-medium hover:text-green-700">
              Create one free
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-carbon-400 mt-6">
          🌍 Every tracked action brings us closer to a sustainable future
        </p>
      </div>
    </div>
  );
};

export default Login;
