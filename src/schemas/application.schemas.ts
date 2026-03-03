import { z } from 'zod'

export const updateApplicationSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED'], {
    message: 'Status must be PENDING, APPROVED or REJECTED',
  }),
})

export type UpdateApplicationDTO = z.infer<typeof updateApplicationSchema>
