import { z } from 'zod';

export const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  author: z.string().min(1, 'Author is required').optional(),
  year: z.coerce.number().int().min(1000).max(2100).optional(),
});

export type CreateBookDto = z.infer<typeof createBookSchema>;

export const updateBookSchema = createBookSchema.partial();

export type UpdateBookDto = z.infer<typeof updateBookSchema>;
