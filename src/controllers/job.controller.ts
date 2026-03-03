import { FastifyRequest, FastifyReply } from 'fastify'
import { createJobSchema, updateJobSchema } from '../schemas/job.schemas.js'
import { prisma } from '../lib/prisma.js'

export class JobController {
  // ============================================
  // POST /jobs → Company cria vaga
  // ============================================
  static async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.user
      const data = createJobSchema.parse(request.body)

      // Busca a company do usuário logado
      const company = await prisma.company.findUnique({
        where: { userId },
      })

      if (!company) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Company profile not found',
        })
      }

      const job = await prisma.job.create({
        data: {
          ...data,
          companyId: company.id,
        },
      })

      return reply.status(201).send(job)
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Validation Error',
          details: error.errors,
        })
      }

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while creating job',
      })
    }
  }

  // ============================================
  // GET /jobs → Listar vagas (público)
  // ============================================
  static async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const jobs = await prisma.job.findMany({
        where: { status: 'OPEN' },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              website: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return reply.status(200).send(jobs)
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while fetching jobs',
      })
    }
  }

  // ============================================
  // GET /jobs/:id → Ver vaga específica (público)
  // ============================================
  static async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params

      const job = await prisma.job.findUnique({
        where: { id },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              website: true,
              description: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
      })

      if (!job) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Job not found',
        })
      }

      return reply.status(200).send(job)
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while fetching job',
      })
    }
  }

  // ============================================
  // PATCH /jobs/:id → Company atualiza vaga
  // ============================================
  static async update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { userId } = request.user
      const { id } = request.params
      const data = updateJobSchema.parse(request.body)

      // Verifica se a vaga existe
      const job = await prisma.job.findUnique({
        where: { id },
        include: { company: true },
      })

      if (!job) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Job not found',
        })
      }

      // Verifica se a vaga pertence à company do usuário logado
      if (job.company.userId !== userId) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'You can only update your own jobs',
        })
      }

      const updatedJob = await prisma.job.update({
        where: { id },
        data,
      })

      return reply.status(200).send(updatedJob)
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Validation Error',
          details: error.errors,
        })
      }

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while updating job',
      })
    }
  }

  // ============================================
  // DELETE /jobs/:id → Company deleta vaga
  // ============================================
  static async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { userId } = request.user
      const { id } = request.params

      // Verifica se a vaga existe
      const job = await prisma.job.findUnique({
        where: { id },
        include: { company: true },
      })

      if (!job) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Job not found',
        })
      }

      // Verifica se a vaga pertence à company do usuário logado
      if (job.company.userId !== userId) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'You can only delete your own jobs',
        })
      }

      await prisma.job.delete({
        where: { id },
      })

      return reply.status(200).send({
        message: 'Job deleted successfully',
      })
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while deleting job',
      })
    }
  }
}
