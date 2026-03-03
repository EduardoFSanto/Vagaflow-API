import { FastifyInstance } from 'fastify'
import { JobController } from '../controllers/job.controller.js'
import { authenticate, requireCompany } from '../middlewares/auth.middleware.js'

export async function jobRoutes(fastify: FastifyInstance) {
  // ============================================
  // ROTAS PÚBLICAS (sem autenticação)
  // ============================================

  // GET /jobs → Listar vagas abertas
  fastify.get('/', JobController.list)

  // GET /jobs/:id → Ver vaga específica
  fastify.get<{ Params: { id: string } }>('/:id', JobController.getById)

  // ============================================
  // ROTAS PROTEGIDAS (só Company)
  // ============================================

  // POST /jobs → Criar vaga
  fastify.post(
    '/',
    {
      preHandler: [authenticate, requireCompany],
    },
    JobController.create,
  )

  // PATCH /jobs/:id → Atualizar vaga
  fastify.patch<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [authenticate, requireCompany],
    },
    JobController.update,
  )

  // DELETE /jobs/:id → Deletar vaga
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [authenticate, requireCompany],
    },
    JobController.delete,
  )
}
