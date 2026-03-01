import { z } from 'zod'

export const updateCompanySchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  cnpj: z.string().optional(),
  website: z.string().url().optional(),
  logo: z.string().url().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export type UpdateCompanyDTO = z.infer<typeof updateCompanySchema>
