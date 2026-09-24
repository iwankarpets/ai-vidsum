import { z } from 'zod';

export const getVideoInfoSchema = z.object({
  body: z.object({
    url: z.string().url('Invalid URL format'),
  }),
});
