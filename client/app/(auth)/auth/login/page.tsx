"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/lib/hooks/queries/auth";
import { loginSchema, LoginSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import Link from "next/link";
import { ApiErrorData } from "@/lib/api/types";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const login = useLogin();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginSchema) => {
    try {
      setError(null);
      await login.mutateAsync(data);
    } catch (error: unknown) {
      if (!axios.isAxiosError<ApiErrorData>(error)) {
        setError("Something went wrong. Please try again");
        return;
      }

      const errorMessage = error.response?.data?.message;
      if (error.response?.data?.code === 'INVALID_CREDENTIALS') {
          setError('Invalid email or password. Please try again');
      } else if (error.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
          setError('Please verify your email before logging in.');
      } else {
        setError(errorMessage || "Something went wrong. Please try again");
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to sign in
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="text-sm">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(onSubmit)(e);
        }}
      >
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
                id={field.name}
                type="email"
                placeholder="you@example.com"
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Password</FieldLabel>
              <Input
                id={field.name}
                type="password"
                placeholder="••••••••"
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <div className="flex items-center justify-end">
          <Link
            href="/auth/register"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Don&apos;t have an account? Sign up
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={login.isPending}>
          {login.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Signing in....
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </div>
  );
}
