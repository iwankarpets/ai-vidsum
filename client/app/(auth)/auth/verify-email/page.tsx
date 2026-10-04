'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { authApi } from '@/lib/api/auth';
import axios from 'axios';
import { Loader2, MailCheck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface ApiErrorData {
  status: 'error';
  message: string;
  code?: string;
}

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast.error('Invalid verification link');
      router.push('/auth/login');
      return;
    }

    const verifyEmail = async () => {
      try {
        await authApi.verifyEmail(token);
        toast.success('Email verified successfully');
        router.push('/auth/login?verified=true');
      } catch (error: unknown) {
        if (axios.isAxiosError<ApiErrorData>(error)) {
          const code = error.response?.data?.code;

          if (code === 'VERIFICATION_TOKEN_EXPIRED') {
            toast.error('This verification link has expired. Please request a new one.');
          } else if (code === 'INVALID_VERIFICATION_TOKEN') {
            toast.error('Invalid verification link.');
          } else {
            toast.error(error.response?.data?.message ?? 'Something went wrong');
          }
        } else {
          toast.error('Something went wrong');
        }
        router.push('/auth/login');
      }
    };

    void verifyEmail();
  }, [token, router]);

  return (
    <Card className="w-full max-w-[400px]">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
          <MailCheck className="size-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Email Verification</CardTitle>
        <CardDescription>
          Please verify your email to continue using our platform
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center py-6">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </CardContent>
    </Card>
  );
}