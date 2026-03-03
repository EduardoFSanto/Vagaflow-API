import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import 'dotenv/config'

import { authRoutes } from './routes/auth.routes.js'
import { companyRoutes } from './routes/company.routes.js'
import { candidateRoutes } from './routes/candidate.routes.js'
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
await app.register(companyRoutes, { prefix: '/company' })
await app.register(candidateRoutes, { prefix: '/candidate' })

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

// Protected route (test)
app.get('/protected', { preHandler: [authenticate] }, async (request) => {
  return {
    message: 'You are authenticated!',
    user: request.user,
  }
})

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
  console.log(`🏢 Company endpoints:`)
  console.log(`   GET   http://localhost:${port}/company/profile`)
  console.log(`   PATCH http://localhost:${port}/company/profile`)
  console.log(`   DELETE http://localhost:${port}/company/profile`)
  console.log(`👤 Candidate endpoints:`)
  console.log(`   GET   http://localhost:${port}/candidate/profile`)
  console.log(`   PATCH http://localhost:${port}/candidate/profile`)
  console.log(`   DELETE http://localhost:${port}/candidate/profile`)
})

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...')
  await app.close()
  process.exit(0)
})
