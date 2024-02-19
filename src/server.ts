import fastify from 'fastify'
import { database } from './database'

const server = fastify()

server.get('/hello', async (request, reply) => {
  const teste = await database('sqlite_schema').select('*')
  return teste
})

server.listen({ port: 3333 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
