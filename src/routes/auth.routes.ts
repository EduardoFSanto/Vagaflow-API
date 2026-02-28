import { FastifyInstance } from 'fastify'
import { AuthController } from '../controllers/auth.controller.js'

/**
 * Auth Routes
 * Public authentication endpoints
 */
export async function authRoutes(fastify: FastifyInstance) {
  // POST /auth/register
  fastify.post('/register', AuthController.register)

  // POST /auth/login
  fastify.post('/login', AuthController.login)
}
