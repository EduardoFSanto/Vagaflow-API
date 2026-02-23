import Fastify from 'fastify'

const app = Fastify()

app.get('/', async () => {
  return { message: 'Vagaflow API is running!' }
})

app.listen({ port: 3000 }, () => {
  console.log('Server running on http://localhost:3000')
})
