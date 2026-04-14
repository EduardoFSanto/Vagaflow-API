import { z } from 'zod'

export const updateCompanySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .optional(),
  cnpj: z
    .string()
    .regex(
      /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
      'CNPJ must be in format XX.XXX.XXX/XXXX-XX',
    )
    .optional(),
  website: z.string().url('Invalid website URL').optional(),
  logo: z.string().url('Invalid logo URL').optional(),
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
  industry: z.string().optional(),
  companySize: z.enum(['1-50', '51-200', '201-500', '500+']).optional(),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional(),
})

export type UpdateCompanyDTO = z.infer<typeof updateCompanySchema>
