import { z } from 'zod';

export const createNoteSchema = z.object({
  note: z.string().min(1, { message: 'Note cannot be empty' }),
});
