import { FastifyRequest, FastifyReply } from 'fastify'
import { updateApplicationSchema } from '../schemas/application.schemas.js'
import { prisma } from '../lib/prisma.js'

export class ApplicationController {
  // ============================================
  // POST /applications/:jobId → Candidate se candidata
  // ============================================
  static async apply(
    request: FastifyRequest<{ Params: { jobId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { userId } = request.user
      const { jobId } = request.params

      // Busca o candidate do usuário logado
      const candidate = await prisma.candidate.findUnique({
        where: { userId },
      })

      if (!candidate) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Candidate profile not found',
        })
      }

      // Verifica se a vaga existe e está aberta
      const job = await prisma.job.findUnique({
        where: { id: jobId },
      })

      if (!job) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Job not found',
        })
      }

      if (job.status !== 'OPEN') {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'This job is not open for applications',
        })
      }

      // Verifica se já se candidatou a essa vaga
      const alreadyApplied = await prisma.application.findFirst({
        where: {
          candidateId: candidate.id,
          jobId,
        },
      })

      if (alreadyApplied) {
        return reply.status(409).send({
          error: 'Conflict',
          message: 'You have already applied to this job',
        })
      }

      const application = await prisma.application.create({
        data: {
          candidateId: candidate.id,
          jobId,
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              company: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      })

      return reply.status(201).send(application)
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while applying to job',
      })
    }
  }

  // ============================================
  // GET /applications → Candidate vê suas candidaturas
  // ============================================
  static async listByCandidate(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.user

      const candidate = await prisma.candidate.findUnique({
        where: { userId },
      })

      if (!candidate) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Candidate profile not found',
        })
      }

      const applications = await prisma.application.findMany({
        where: { candidateId: candidate.id },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              location: true,
              remote: true,
              type: true,
              company: {
                select: {
                  id: true,
                  name: true,
                  logo: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return reply.status(200).send(applications)
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while fetching applications',
      })
    }
  }

  // ============================================
  // GET /applications/company → Company vê candidaturas
  // ============================================
  static async listByCompany(request: FastifyRequest, reply: FastifyReply) {
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

      const applications = await prisma.application.findMany({
        where: {
          job: {
            companyId: company.id,
          },
        },
        include: {
          candidate: {
            select: {
              id: true,
              name: true,
              bio: true,
              skills: true,
              experience: true,
              resumeUrl: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          job: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return reply.status(200).send(applications)
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while fetching applications',
      })
    }
  }

  // ============================================
  // PATCH /applications/:id → Company atualiza status
  // ============================================
  static async updateStatus(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { userId } = request.user
      const { id } = request.params
      const data = updateApplicationSchema.parse(request.body)

      // Verifica se a candidatura existe
      const application = await prisma.application.findUnique({
        where: { id },
        include: {
          job: {
            include: {
              company: true,
            },
          },
        },
      })

      if (!application) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Application not found',
        })
      }

      // Verifica se a vaga pertence à company do usuário logado
      if (application.job.company.userId !== userId) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'You can only update applications for your own jobs',
        })
      }

      const updatedApplication = await prisma.application.update({
        where: { id },
        data: { status: data.status },
        include: {
          candidate: {
            select: {
              name: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          job: {
            select: {
              title: true,
            },
          },
        },
      })

      return reply.status(200).send(updatedApplication)
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Validation Error',
          details: error.errors,
        })
      }

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while updating application status',
      })
    }
  }
}
