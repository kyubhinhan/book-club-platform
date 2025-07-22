'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button, TextField } from '@mui/material';

interface CompleteProfileFormData {
  name: string;
  email: string;
}

export default function CompleteProfile() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CompleteProfileFormData>();

  // 세션에서 기본값 설정
  useEffect(() => {
    if (session?.user) {
      if (session.user.name) {
        setValue('name', session.user.name);
      }
      if (session.user.email) {
        setValue('email', session.user.email);
      }
    }
  }, [session, setValue]);

  // 이미 프로필이 완성된 사용자는 홈으로 리다이렉트
  useEffect(() => {
    if (
      status === 'authenticated' &&
      session?.user?.name &&
      session?.user?.email
    ) {
      router.push('/');
    }
  }, [status, session, router]);

  const onSubmit = async (data: CompleteProfileFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
        }),
      });

      if (response.ok) {
        await update();
        window.location.replace('/');
      } else {
        const errorData = await response.json();
        setError(
          errorData.message || '프로필 업데이트 중 오류가 발생했습니다.'
        );
      }
    } catch {
      setError('프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            프로필 완성하기
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            서비스 이용을 위해 추가 정보를 입력해주세요
          </p>
        </div>

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
              id="name"
              label="이름"
              autoComplete="name"
              autoFocus
              {...register('name', {
                required: '이름을 입력해주세요',
                minLength: {
                  value: 2,
                  message: '이름은 최소 2자 이상이어야 합니다',
                },
              })}
              error={!!errors.name}
              helperText={errors.name?.message}
              disabled={isLoading}
              className="w-full"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="이메일"
              type="email"
              autoComplete="email"
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
            {isLoading ? '저장 중...' : '프로필 완성하기'}
          </Button>
        </form>
      </div>
    </div>
  );
}
