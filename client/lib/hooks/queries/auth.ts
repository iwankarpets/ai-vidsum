import { useRouter } from 'next/navigation';
import { useAuth } from '../auth';
import { authApi } from '@/lib/api/auth';
import { useMutation } from '@tanstack/react-query';
import { type LoginPayload, type RegisterPayload } from '@/lib/api/types';

export function useLogin() {
  const { login } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginPayload) => authApi.login(data),
    onSuccess: (data) => {
      login(data.token, data.user);
      router.push('/dashboard');
    },
  });
}

export function useRegister() {
  const { login } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterPayload) => authApi.register(data),
    onSuccess: (data) => {
      login(data.token, data.user);
      router.push('/dashboard');
    },
  });
}