import { FastifyRequest, FastifyReply } from 'fastify'
import bcrypt from 'bcryptjs'
import { registerSchema, loginSchema } from '../schemas/auth.schemas.js'
import { prisma } from '../lib/prisma.js'

export class AuthController {
  /**
   * POST /auth/register
   * Register new user (CANDIDATE or COMPANY)
   */
  static async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Validate body
      const data = registerSchema.parse(request.body)

      // Check if email already exists
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      })

      if (emailExists) {
        return reply.status(409).send({
          error: 'Email already exists',
        })
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 10)

      // Create User + Candidate/Company
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: passwordHash,
          role: data.role,
          ...(data.role === 'CANDIDATE' && {
            candidate: {
              create: {
                name: data.name,
              },
            },
          }),
          ...(data.role === 'COMPANY' && {
            company: {
              create: {
                name: data.name,
              },
            },
          }),
        },
        include: {
          candidate: true,
          company: true,
        },
      })

      // Generate JWT token
      const token = request.server.jwt.sign({
        userId: user.id,
        role: user.role,
      })

      return reply.status(201).send({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.candidate || user.company,
        },
        token,
      })
    } catch (error: any) {
      // Zod validation error
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Validation error',
          details: error.errors,
        })
      }

      throw error
    }
  }

  /**
   * POST /auth/login
   * Authenticate user and return JWT
   */
  static async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Validate body
      const data = loginSchema.parse(request.body)

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: data.email },
        include: {
          candidate: true,
          company: true,
        },
      })

      if (!user) {
        return reply.status(404).send({
          error: 'User not found',
        })
      }

      // Compare password
      const isValidPassword = await bcrypt.compare(data.password, user.password)

      if (!isValidPassword) {
        return reply.status(401).send({
          error: 'Invalid credentials',
        })
      }

      // Generate JWT token
      const token = request.server.jwt.sign({
        userId: user.id,
        role: user.role,
      })

      return reply.status(200).send({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.candidate || user.company,
        },
        token,
      })
    } catch (error: any) {
      // Zod validation error
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Validation error',
          details: error.errors,
        })
      }

      throw error
    }
  }
}
