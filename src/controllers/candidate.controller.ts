import { FastifyRequest, FastifyReply } from 'fastify'
import { updateCandidateSchema } from '../schemas/candidate.schemas.js'
import { prisma } from '../lib/prisma.js'

export class CandidateController {
  // ============================================
  // GET /candidate/profile
  // ============================================
  static async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.user

      const candidate = await prisma.candidate.findUnique({
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
          applications: {
            select: {
              id: true,
              status: true,
              createdAt: true,
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
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      })

      if (!candidate) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Candidate profile not found',
        })
      }

      return reply.status(200).send(candidate)
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while fetching candidate profile',
      })
    }
  }

  // ============================================
  // PATCH /candidate/profile
  // ============================================
  static async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.user
      const data = updateCandidateSchema.parse(request.body)

      // Verifica se candidate existe
      const candidateExists = await prisma.candidate.findUnique({
        where: { userId },
      })

      if (!candidateExists) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Candidate profile not found',
        })
      }

      const candidate = await prisma.candidate.update({
        where: { userId },
        data: {
          ...data,
          dateOfBirth: data.dateOfBirth
            ? new Date(data.dateOfBirth)
            : undefined,
        },
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

      return reply.status(200).send(candidate)
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Validation Error',
          details: error.errors,
        })
      }

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while updating candidate profile',
      })
    }
  }

  // ============================================
  // DELETE /candidate/profile
  // ============================================
  static async deleteProfile(request: FastifyRequest, reply: FastifyReply) {
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

      // Deleta o User (cascade deleta Candidate e Applications)
      await prisma.user.delete({
        where: { id: userId },
      })

      return reply.status(200).send({
        message: 'Candidate account deleted successfully',
      })
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while deleting candidate profile',
      })
    }
  }
}
