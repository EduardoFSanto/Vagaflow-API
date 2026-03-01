import { FastifyRequest, FastifyReply } from 'fastify'
import { updateCompanySchema } from '../schemas/company.schemas.js'
import { prisma } from '../lib/prisma.js'

export class CompanyController {
  /**
   * GET /company/profile
   * Get company profile
   */
  static async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const { userId } = request.user

    const company = await prisma.company.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        jobs: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
      },
    })

    if (!company) {
      return reply.status(404).send({
        error: 'Company not found',
      })
    }

    return reply.status(200).send(company)
  }

  /**
   * PATCH /company/profile
   * Update company profile
   */
  static async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.user
      const data = updateCompanySchema.parse(request.body)

      const company = await prisma.company.update({
        where: { userId },
        data,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      })

      return reply.status(200).send(company)
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Validation error',
          details: error.errors,
        })
      }

      throw error
    }
  }
}
