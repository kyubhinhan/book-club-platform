'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button, TextField } from '@mui/material';
import Link from 'next/link';

interface SignInFormData {
  email: string;
  password: string;
}

export default function SignIn() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>();

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('kakao', { callbackUrl: '/auth/complete-profile' });
    } catch {
      setError('카카오 로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          로그인
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="이메일"
              type="email"
              autoComplete="email"
              autoFocus
              {...register('email', {
                required: '이메일을 입력해주세요',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: '올바른 이메일 형식이 아닙니다',
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={isLoading}
              className="w-full"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="비밀번호"
              type="password"
              id="password"
              autoComplete="current-password"
              {...register('password', {
                required: '비밀번호를 입력해주세요',
                minLength: {
                  value: 6,
                  message: '비밀번호는 최소 6자 이상이어야 합니다',
                },
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{
              backgroundColor: '#2563eb',
              '&:hover': {
                backgroundColor: '#1d4ed8',
              },
              '&:disabled': {
                backgroundColor: '#9ca3af',
              },
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              padding: '12px 16px',
              borderRadius: '6px',
              boxShadow: 'none',
              '&:focus': {
                outline: 'none',
                boxShadow: '0 0 0 2px #ffffff, 0 0 0 4px #3b82f6',
              },
            }}
          >
            {isLoading ? '로그인 중...' : '이메일로 로그인'}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">또는</span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              fullWidth
              variant="outlined"
              onClick={handleKakaoSignIn}
              disabled={isLoading}
              sx={{
                backgroundColor: '#fbbf24',
                color: '#000000',
                borderColor: '#fbbf24',
                '&:hover': {
                  backgroundColor: '#f59e0b',
                  borderColor: '#f59e0b',
                },
                '&:disabled': {
                  backgroundColor: '#9ca3af',
                  borderColor: '#9ca3af',
                },
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                padding: '12px 16px',
                borderRadius: '6px',
                boxShadow: 'none',
                '&:focus': {
                  outline: 'none',
                  boxShadow: '0 0 0 2px #ffffff, 0 0 0 4px #f59e0b',
                },
              }}
            >
              카카오로 로그인
            </Button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link
              href="/auth/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
