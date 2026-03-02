import { FastifyInstance } from 'fastify'
import { CompanyController } from '../controllers/company.controller.js'
import { authenticate, requireCompany } from '../middlewares/auth.middleware.js'

export async function companyRoutes(fastify: FastifyInstance) {
  // Todas as rotas exigem autenticação + role COMPANY
  fastify.addHook('preHandler', authenticate)
  fastify.addHook('preHandler', requireCompany)

  // GET /company/profile → Ver perfil
  fastify.get('/profile', CompanyController.getProfile)

  // PATCH /company/profile → Atualizar perfil
  fastify.patch('/profile', CompanyController.updateProfile)

  // DELETE /company/profile → Deletar conta
  fastify.delete('/profile', CompanyController.deleteProfile)
}
