import { FastifyRequest, FastifyReply } from 'fastify'
import {
  createApplicationSchema,
  updateApplicationSchema,
} from '../schemas/application.schemas.js'
import { prisma } from '../lib/prisma.js'

export class ApplicationController {
  // ============================================
  // POST /applications/:jobId -> Candidate se candidata
  // ============================================
  static async apply(
    request: FastifyRequest<{ Params: { jobId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { userId } = request.user
      const { jobId } = request.params
      const data = createApplicationSchema.parse(request.body ?? {})
      const { questionAnswers = [], ...applicationData } = data

      const candidate = await prisma.candidate.findUnique({
        where: { userId },
      })

      if (!candidate) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Candidate profile not found',
        })
      }

      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: {
          questions: {
            select: {
              id: true,
              required: true,
              type: true,
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

      if (job.status !== 'OPEN') {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'This job is not open for applications',
        })
      }

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

      const questionMap = new Map(job.questions.map((q) => [q.id, q]))
      const answeredQuestionIds = new Set<string>()
      const normalizedAnswers: { questionId: string; answer: string }[] = []

      for (const item of questionAnswers) {
        const question = questionMap.get(item.questionId)

        if (!question) {
          return reply.status(400).send({
            error: 'Validation Error',
            message: 'One or more answers reference invalid job questions',
          })
        }

        if (answeredQuestionIds.has(item.questionId)) {
          return reply.status(400).send({
            error: 'Validation Error',
            message: 'Duplicate answers for the same question are not allowed',
          })
        }

        answeredQuestionIds.add(item.questionId)

        const trimmedAnswer = item.answer.trim()
        if (question.type === 'YES_NO') {
          const normalizedYesNoAnswer = trimmedAnswer.toUpperCase()
          if (
            normalizedYesNoAnswer !== 'YES' &&
            normalizedYesNoAnswer !== 'NO'
          ) {
            return reply.status(400).send({
              error: 'Validation Error',
              message:
                'Yes/No questions only accept YES or NO as answer values',
            })
          }

          normalizedAnswers.push({
            questionId: item.questionId,
            answer: normalizedYesNoAnswer,
          })
          continue
        }

        normalizedAnswers.push({
          questionId: item.questionId,
          answer: trimmedAnswer,
        })
      }

      const hasMissingRequiredAnswer = job.questions.some(
        (question) =>
          question.required && !answeredQuestionIds.has(question.id),
      )

      if (hasMissingRequiredAnswer) {
        return reply.status(400).send({
          error: 'Validation Error',
          message: 'Please answer all required job questions',
        })
      }

      const application = await prisma.application.create({
        data: {
          candidateId: candidate.id,
          jobId,
          coverLetter: applicationData.coverLetter,
          yearsExperience: applicationData.yearsExperience,
          salaryExpected: applicationData.salaryExpected,
          availability: applicationData.availability,
          startDate: applicationData.startDate
            ? new Date(applicationData.startDate)
            : undefined,
          answers: {
            create: normalizedAnswers.map((item) => ({
              questionId: item.questionId,
              answer: item.answer,
            })),
          },
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
          answers: {
            select: {
              id: true,
              answer: true,
              question: {
                select: {
                  id: true,
                  prompt: true,
                  type: true,
                  required: true,
                  order: true,
                },
              },
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      })

      return reply.status(201).send(application)
    } catch (error: any) {
      if (error?.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Validation Error',
          details: error.errors,
        })
      }

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while applying to job',
      })
    }
  }

  // ============================================
  // GET /applications -> Candidate ve suas candidaturas
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
  // GET /applications/company -> Company ve candidaturas
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
        select: {
          id: true,
          status: true,
          createdAt: true,
          coverLetter: true,
          salaryExpected: true,
          availability: true,
          startDate: true,
          yearsExperience: true,
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
          answers: {
            select: {
              id: true,
              answer: true,
              question: {
                select: {
                  id: true,
                  prompt: true,
                  type: true,
                  required: true,
                  order: true,
                },
              },
            },
            orderBy: {
              createdAt: 'asc',
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
  // PATCH /applications/:id -> Company atualiza status
  // ============================================
  static async updateStatus(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { userId } = request.user
      const { id } = request.params
      const data = updateApplicationSchema.parse(request.body)

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
