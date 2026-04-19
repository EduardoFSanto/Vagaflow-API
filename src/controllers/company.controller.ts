import { FastifyRequest, FastifyReply } from 'fastify'
import { updateCompanySchema } from '../schemas/company.schemas.js'
import { prisma } from '../lib/prisma.js'

export class CompanyController {
  // ============================================
  // GET /company/profile
  // ============================================
  static async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.user

      const company = await prisma.company.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              createdAt: true,
            },
          },
          jobs: {
            select: {
              id: true,
              title: true,
              description: true,
              salary: true,
              status: true,
              location: true,
              remote: true,
              type: true,
              questions: {
                select: {
                  id: true,
                  prompt: true,
                  type: true,
                  required: true,
                  order: true,
                },
                orderBy: {
                  order: 'asc',
                },
              },
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      })

      if (!company) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Company profile not found',
        })
      }

      return reply.status(200).send(company)
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while fetching company profile',
      })
    }
  }

  // ============================================
  // PATCH /company/profile
  // ============================================
  static async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.user
      const data = updateCompanySchema.parse(request.body)

      // Verifica se company existe
      const companyExists = await prisma.company.findUnique({
        where: { userId },
      })

      if (!companyExists) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Company profile not found',
        })
      }

      // Verifica se CNPJ já está em uso por outra empresa
      if (data.cnpj) {
        const cnpjInUse = await prisma.company.findFirst({
          where: {
            cnpj: data.cnpj,
            NOT: { userId },
          },
        })

        if (cnpjInUse) {
          return reply.status(409).send({
            error: 'Conflict',
            message: 'CNPJ already in use',
          })
        }
      }

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
          error: 'Validation Error',
          details: error.errors,
        })
      }

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while updating company profile',
      })
    }
  }

  // ============================================
  // DELETE /company/profile
  // ============================================
  static async deleteProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.user

      const company = await prisma.company.findUnique({
        where: { userId },
      })

      if (!company) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Company profile not found',
        })
      }

      // Deleta o User (cascade deleta Company, Jobs e Applications)
      await prisma.user.delete({
        where: { id: userId },
      })

      return reply.status(200).send({
        message: 'Company account deleted successfully',
      })
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while deleting company profile',
      })
    }
  }
}
