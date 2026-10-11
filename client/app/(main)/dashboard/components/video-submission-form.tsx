'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link2 } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { videoSchema, type VideoSchema } from '@/lib/validations/video';
import { submitVideo } from '@/lib/api/video';
import { type ApiErrorData } from '@/lib/api/types';

export default function VideoSubmissionForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<VideoSchema>({
    resolver: zodResolver(videoSchema),
    defaultValues: { url: '' },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: submitVideo,
    onSuccess: (data) => {
      toast.success('Video submitted successfully', {
        description: data.videoInfo.title,
      });
      form.reset();
      void queryClient.invalidateQueries({ queryKey: ['jobs'] });
      void queryClient.invalidateQueries({ queryKey: ['videos'] });
      router.push('/dashboard/history');
    },
    onError: (error) => {
      const message = axios.isAxiosError<ApiErrorData>(error)
        ? error.response?.data?.message
        : undefined;

      toast.error('Failed to submit video', {
        description: message ?? 'Something went wrong. Please try again',
      });
    },
  });

  return (
    <Card className="max-w-2xl p-6 shadow-lg transition-all hover:shadow-xl">
      <CardHeader>
        <CardTitle>Submit a video</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit((data) => mutate(data))}>
          <Controller
            name="url"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>YouTube URL</FieldLabel>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id={field.name}
                    placeholder="https://youtube.com/watch?v=..."
                    className="pl-10"
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Button type="submit" className="mt-4 w-full transition-all" disabled={isPending}>
            {isPending ? 'Submitting...' : 'Submit Video'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
