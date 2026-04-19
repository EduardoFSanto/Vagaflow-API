import { z } from 'zod'

const applicationAnswerSchema = z.object({
  questionId: z.string().uuid('Invalid question id'),
  answer: z
    .string()
    .trim()
    .min(1, 'Answer is required')
    .max(2000, 'Answer must have at most 2000 characters'),
})

export const createApplicationSchema = z.object({
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
  questionAnswers: z.array(applicationAnswerSchema).max(12).optional(),
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
