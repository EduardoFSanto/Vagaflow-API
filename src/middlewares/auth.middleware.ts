import { FastifyRequest, FastifyReply } from 'fastify'

/**
 * Authenticate middleware
 * Verifies JWT token and adds user to request
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    await request.jwtVerify()
    // Token válido! request.user agora tem { userId, role }
  } catch (error) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Invalid or missing token',
    })
  }
}

/**
 * Require COMPANY role
 */
export async function requireCompany(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (request.user.role !== 'COMPANY') {
    return reply.status(403).send({
      error: 'Forbidden',
      message: 'Company access required',
    })
  }
}

/**
 * Require CANDIDATE role
 */
export async function requireCandidate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (request.user.role !== 'CANDIDATE') {
    return reply.status(403).send({
      error: 'Forbidden',
      message: 'Candidate access required',
    })
  }
}
