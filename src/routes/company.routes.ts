import { FastifyInstance } from 'fastify'
import { CompanyController } from '../controllers/company.controller.js'
import { authenticate, requireCompany } from '../middlewares/auth.middleware.js'

/**
 * Company Routes
 * Protected routes for company users
 */
export async function companyRoutes(fastify: FastifyInstance) {
  // All routes require authentication + company role
  fastify.addHook('preHandler', authenticate)
  fastify.addHook('preHandler', requireCompany)

  // GET /company/profile
  fastify.get('/profile', CompanyController.getProfile)

  // PATCH /company/profile
  fastify.patch('/profile', CompanyController.updateProfile)
}
