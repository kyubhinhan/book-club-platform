'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TextField, Button, Box } from '@mui/material';
import { useForm } from 'react-hook-form';

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUp() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError('');

    // 비밀번호 확인
    if (data.password !== data.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setIsLoading(false);
      return;
    }

    // 비밀번호 길이 확인
    if (data.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message || '회원가입 중 오류가 발생했습니다.'
        );
      }

      // 회원가입 성공 시 로그인 페이지로 이동
      router.push(
        '/auth/signin?message=회원가입이 완료되었습니다. 로그인해주세요.'
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : '회원가입 중 오류가 발생했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            회원가입
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2, // 16px spacing (equivalent to space-y-4)
            }}
          >
            <TextField
              {...register('name', {
                required: '이름을 입력해주세요.',
                minLength: {
                  value: 2,
                  message: '이름은 최소 2자 이상이어야 합니다.',
                },
              })}
              label="이름"
              type="text"
              autoComplete="name"
              disabled={isLoading}
              placeholder="이름을 입력하세요"
              fullWidth
              variant="outlined"
              size="small"
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: errors.name ? '#ef4444' : '#d1d5db',
                  },
                  '&:hover fieldset': {
                    borderColor: errors.name ? '#ef4444' : '#3b82f6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: errors.name ? '#ef4444' : '#3b82f6',
                  },
                },
              }}
            />

            <TextField
              {...register('email', {
                required: '이메일을 입력해주세요.',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: '올바른 이메일 형식을 입력해주세요.',
                },
              })}
              label="이메일"
              type="email"
              autoComplete="email"
              disabled={isLoading}
              placeholder="이메일을 입력하세요"
              fullWidth
              variant="outlined"
              size="small"
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: errors.email ? '#ef4444' : '#d1d5db',
                  },
                  '&:hover fieldset': {
                    borderColor: errors.email ? '#ef4444' : '#3b82f6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: errors.email ? '#ef4444' : '#3b82f6',
                  },
                },
              }}
            />

            <TextField
              {...register('password', {
                required: '비밀번호를 입력해주세요.',
                minLength: {
                  value: 6,
                  message: '비밀번호는 최소 6자 이상이어야 합니다.',
                },
              })}
              label="비밀번호"
              type="password"
              autoComplete="new-password"
              disabled={isLoading}
              placeholder="비밀번호를 입력하세요"
              fullWidth
              variant="outlined"
              size="small"
              error={!!errors.password}
              helperText={errors.password?.message || '최소 6자 이상'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: errors.password ? '#ef4444' : '#d1d5db',
                  },
                  '&:hover fieldset': {
                    borderColor: errors.password ? '#ef4444' : '#3b82f6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: errors.password ? '#ef4444' : '#3b82f6',
                  },
                },
              }}
            />

            <TextField
              {...register('confirmPassword', {
                required: '비밀번호 확인을 입력해주세요.',
                validate: (value) =>
                  value === password || '비밀번호가 일치하지 않습니다.',
              })}
              label="비밀번호 확인"
              type="password"
              autoComplete="new-password"
              disabled={isLoading}
              placeholder="비밀번호를 다시 입력하세요"
              fullWidth
              variant="outlined"
              size="small"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: errors.confirmPassword ? '#ef4444' : '#d1d5db',
                  },
                  '&:hover fieldset': {
                    borderColor: errors.confirmPassword ? '#ef4444' : '#3b82f6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: errors.confirmPassword ? '#ef4444' : '#3b82f6',
                  },
                },
              }}
            />
          </Box>

          <Button
            type="submit"
            disabled={isLoading}
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: '#2563eb',
              '&:hover': {
                backgroundColor: '#1d4ed8',
              },
              '&:disabled': {
                backgroundColor: '#9ca3af',
              },
              py: 1.5,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            {isLoading ? '회원가입 중...' : '회원가입'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link
              href="/auth/signin"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
