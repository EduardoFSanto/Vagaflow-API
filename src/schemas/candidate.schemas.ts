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
  city: z.string().optional(),
  state: z.string().min(2).max(2).optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  dateOfBirth: z.string().datetime('Invalid date format').optional(),
  bio: z.string().min(10, 'Bio must be at least 10 characters').optional(),
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
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
  portfolioUrl: z.string().url('Invalid portfolio URL').optional(),
  education: z.string().optional(),
  university: z.string().optional(),
  graduationYear: z
    .number()
    .min(1900)
    .max(new Date().getFullYear() + 10)
    .optional(),
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  availability: z
    .enum(['IMMEDIATE', '30_DAYS', '60_DAYS', 'NEGOTIABLE'])
    .optional(),
  employmentType: z.array(z.enum(['CLT', 'PJ', 'AUTONOMO'])).optional(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional(),
  githubUrl: z.string().url('Invalid GitHub URL').optional(),
  expectedSalary: z.number().positive('Salary must be positive').optional(),
  salaryExpected: z.string().optional(),
})

export type UpdateCandidateDTO = z.infer<typeof updateCandidateSchema>
