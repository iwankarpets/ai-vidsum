import { z } from 'zod';

const urlBodySchema = z.object({
  body: z.object({
    url: z.string().url('Invalid URL format'),
  }),
});

export const getVideoInfoSchema = urlBodySchema;
export const downloadAudioSchema = urlBodySchema;
export const transcribeVideoSchema = urlBodySchema;

export type GetVideoInfoInput = z.infer<typeof getVideoInfoSchema>['body'];
