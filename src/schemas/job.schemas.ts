import { z } from 'zod'

const jobQuestionSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(10, 'Question prompt must be at least 10 characters')
    .max(240, 'Question prompt must have at most 240 characters'),
  type: z.enum(['SHORT_TEXT', 'LONG_TEXT']).default('SHORT_TEXT'),
  required: z.boolean().default(false),
})

export const createJobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  salary: z.number().positive('Salary must be a positive number').optional(),
  salaryMin: z.number().positive('Salary min must be positive').optional(),
  salaryMax: z.number().positive('Salary max must be positive').optional(),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  remote: z.boolean().default(false),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT']).default('FULL_TIME'),
  requiredSkills: z.array(z.string()).optional(),
  requiredExperience: z.number().int().min(0).optional(),
  educationLevel: z.string().optional(),
  department: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  schedule: z.string().optional(),
  languages: z.array(z.string()).optional(),
  questions: z.array(jobQuestionSchema).max(8).optional(),
})

export const updateJobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .optional(),
  salary: z.number().positive('Salary must be a positive number').optional(),
  salaryMin: z.number().positive('Salary min must be positive').optional(),
  salaryMax: z.number().positive('Salary max must be positive').optional(),
  location: z
    .string()
    .min(3, 'Location must be at least 3 characters')
    .optional(),
  remote: z.boolean().optional(),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT']).optional(),
  status: z.enum(['OPEN', 'CLOSED', 'PAUSED']).optional(),
  requiredSkills: z.array(z.string()).optional(),
  requiredExperience: z.number().int().min(0).optional(),
  educationLevel: z.string().optional(),
  department: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  schedule: z.string().optional(),
  languages: z.array(z.string()).optional(),
  questions: z.array(jobQuestionSchema).max(8).optional(),
})

export type CreateJobDTO = z.infer<typeof createJobSchema>
export type UpdateJobDTO = z.infer<typeof updateJobSchema>
