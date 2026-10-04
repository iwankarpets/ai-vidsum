"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { registerSchema, RegisterSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { Controller, Form, useForm } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegister } from "@/lib/hooks/queries/auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { ApiErrorData } from "@/lib/api/types";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const register = useRegister();
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterSchema) => {
  try {
    setError(null);
    await register.mutateAsync({
      email: data.email,
      password: data.password,
      ...(data.name?.trim() && { name: data.name.trim() }),
    });

    toast.success('Account created successfully');
  } catch (err: unknown) {
    if (!axios.isAxiosError<ApiErrorData>(err)) {
      setError('Something went wrong');
      return;
    }

    const code = err.response?.data?.code;

    if (code === 'EMAIL_ALREADY_EXISTS') {
      setError('Email already in use');
    } else {
      setError(err.response?.data?.message ?? 'Something went wrong');
    }
  }
};

  return (
    <div>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your details below to create an account
        </p>
      </div>
      {error && (
        <Alert variant={"destructive"} className="text-sm">
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
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Name</FieldLabel>
              <Input
                id={field.name}
                placeholder="Your name..."
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

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
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
              <Input
                id={field.name}
                type="password"
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex items-center justify-end">
          <Link
            href="/auth/login"
            className="text-sm text-muted-foregroun hover:text-primary"
          >
            Already have an account? Sign in
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={register.isPending}>
          {register.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Register"
          )}
        </Button>
      </form>
    </div>
  );
}
