import { z } from 'zod';

const urlBodySchema = z.object({
  body: z.object({
    url: z.string().url('Invalid URL format'),
  }),
});

export const getVideoByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid video ID'),
  }),
});

export const getJobStatusSchema = z.object({
  params: z.object({
    jobId: z.string().min(1, 'Job ID is required'),
  }),
});

export const getVideoInfoSchema = urlBodySchema;
export const downloadAudioSchema = urlBodySchema;
export const transcribeVideoSchema = urlBodySchema;

export type GetVideoInfoInput = z.infer<typeof getVideoInfoSchema>['body'];
