import { FastifyInstance } from 'fastify'
import { CandidateController } from '../controllers/candidate.controller.js'
import {
  authenticate,
  requireCandidate,
} from '../middlewares/auth.middleware.js'

export async function candidateRoutes(fastify: FastifyInstance) {
  // Todas as rotas exigem autenticação + role CANDIDATE
  fastify.addHook('preHandler', authenticate)
  fastify.addHook('preHandler', requireCandidate)

  fastify.get('/profile', CandidateController.getProfile)

  fastify.patch('/profile', CandidateController.updateProfile)

  fastify.delete('/profile', CandidateController.deleteProfile)
}
