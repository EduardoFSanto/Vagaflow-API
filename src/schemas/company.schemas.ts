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
})

export type UpdateCompanyDTO = z.infer<typeof updateCompanySchema>
