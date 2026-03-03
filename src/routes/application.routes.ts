import { FastifyInstance } from 'fastify'
import { ApplicationController } from '../controllers/application.controller.js'
import {
  authenticate,
  requireCandidate,
  requireCompany,
} from '../middlewares/auth.middleware.js'

export async function applicationRoutes(fastify: FastifyInstance) {
  // POST /applications/:jobId → Candidate se candidata
  fastify.post<{ Params: { jobId: string } }>(
    '/:jobId',
    {
      preHandler: [authenticate, requireCandidate],
    },
    ApplicationController.apply,
  )

  // GET /applications → Candidate vê suas candidaturas
  fastify.get(
    '/',
    {
      preHandler: [authenticate, requireCandidate],
    },
    ApplicationController.listByCandidate,
  )

  // ============================================
  // ROTAS DA COMPANY
  // ============================================

  // GET /applications/company → Company vê candidaturas
  fastify.get(
    '/company',
    {
      preHandler: [authenticate, requireCompany],
    },
    ApplicationController.listByCompany,
  )

  // PATCH /applications/:id → Company atualiza status
  fastify.patch<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [authenticate, requireCompany],
    },
    ApplicationController.updateStatus,
  )
}
