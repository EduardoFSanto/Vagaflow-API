import { z } from 'zod'

export const createApplicationSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  coverLetter: z
    .string()
    .min(20, 'Cover letter must be at least 20 characters')
    .optional(),
  yearsExperience: z.number().int().min(0).optional(),
  salaryExpected: z.number().positive().optional(),
  startDate: z.string().datetime().optional(),
  availability: z
    .enum(['IMMEDIATE', '2_WEEKS', '1_MONTH', 'NEGOTIABLE'])
    .optional(),
})

export const updateApplicationSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWING', 'APPROVED', 'REJECTED', 'HIRED'], {
    message: 'Status must be PENDING, REVIEWING, APPROVED, REJECTED or HIRED',
  }),
  notes: z.string().optional(),
  rejectionReason: z.string().optional(),
})

export type CreateApplicationDTO = z.infer<typeof createApplicationSchema>
export type UpdateApplicationDTO = z.infer<typeof updateApplicationSchema>
