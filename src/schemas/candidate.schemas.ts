import { z } from 'zod'

export const updateCandidateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z
    .string()
    .regex(
      /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
      'Phone must be in format (XX) XXXXX-XXXX',
    )
    .optional(),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .optional(),
  dateOfBirth: z.string().datetime('Invalid date format').optional(),
  bio: z.string().min(10, 'Bio must be at least 10 characters').optional(),
  skills: z
    .array(z.string())
    .min(1, 'At least one skill is required')
    .optional(),
  experience: z
    .number()
    .int()
    .min(0, 'Experience must be a positive number')
    .optional(),
  resumeUrl: z.string().url('Invalid resume URL').optional(),
})

export type UpdateCandidateDTO = z.infer<typeof updateCandidateSchema>
