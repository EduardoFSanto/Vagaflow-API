import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import 'dotenv/config'
import type { FastifyRequest } from 'fastify'

import { authRoutes } from './routes/auth.routes.js'
import { authenticate } from './middlewares/auth.middleware.js'

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'info' : 'error',
  },
})

// Register CORS
await app.register(cors, {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
})

// Register JWT
await app.register(jwt, {
  secret: process.env.JWT_SECRET || 'fallback-secret-change-this',
})

// Register routes
await app.register(authRoutes, { prefix: '/auth' })

// Health check
app.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  }
})

// Root route
app.get('/', async () => {
  return { message: 'Vagaflow API is running!' }
})

// Protected route
app.get(
  '/protected',
  {
    preHandler: [authenticate],
  },
  async (request: FastifyRequest) => {
    return {
      message: 'You are authenticated!',
      user: request.user,
    }
  },
)

// Start server
const port = Number(process.env.PORT) || 3333
const host = '0.0.0.0'

app.listen({ port, host }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }

  console.log(`🚀 Server running on http://localhost:${port}`)
  console.log(`📚 Health check: http://localhost:${port}/health`)
  console.log(`🔐 Auth endpoints:`)
  console.log(`   POST http://localhost:${port}/auth/register`)
  console.log(`   POST http://localhost:${port}/auth/login`)
})

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...')
  await app.close()
  process.exit(0)
})
