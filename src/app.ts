import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { transactionRoutes } from './routes/trasactions.routes'

export const app = fastify()

app.register(cookie)

app.register(transactionRoutes, { prefix: '/transactions' })
