import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { database } from '../database'
import { randomUUID } from 'crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-existis'

export async function transactionRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
      schema: {
        description: 'Get all transactions',
        tags: ['transactions'],
        response: {
          200: {
            type: 'object',
            properties: {
              transactions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    amount: { type: 'number' },
                    created_at: { type: 'string' },
                    session_id: { type: 'string' },
                  },
                },
              },
              balance: {
                type: 'object',
                properties: {
                  income: { type: 'number' },
                  outcome: { type: 'number' },
                  total: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const transactions = await database('transactions')
        .where({ session_id: sessionId })
        .select('*')

      const balance = transactions.reduce(
        (acc, transaction) => {
          if (transaction.amount > 0) {
            acc.income += transaction.amount
          } else {
            acc.outcome += transaction.amount
          }

          acc.total = acc.income + acc.outcome

          return acc
        },
        { income: 0, outcome: 0, total: 0 },
      )

      return reply.send({ transactions, balance })
    },
  )
  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
      schema: {
        description: 'Get a specific transaction',
        tags: ['transactions'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              transaction: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  amount: { type: 'number' },
                  created_at: { type: 'string' },
                  session_id: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const getTransactionParams = z.object({
        id: z.string().uuid(),
      })
      const { id } = getTransactionParams.parse(request.params)
      const { sessionId } = request.cookies
      const transaction = await database('transactions')
        .where({ id, session_id: sessionId })
        .first()

      if (!transaction) {
        return reply.status(404).send('Transaction not found')
      }

      return reply.send({ transaction })
    },
  )
  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
      schema: {
        description: 'Get a summary of all transactions',
        tags: ['transactions'],
        response: {
          200: {
            type: 'object',
            properties: {
              summary: {
                type: 'object',
                properties: {
                  amount: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { sessionId } = request.cookies
      const summary = await database('transactions')
        .where({ session_id: sessionId })
        .sum('amount', { as: 'amount' })
        .first()
      return reply.send({ summary })
    },
  )
  app.post(
    '/',
    {
      schema: {
        description: 'Create a transaction',
        tags: ['transactions'],
        body: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            amount: { type: 'number' },
            type: { type: 'string' },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const createTransactionBody = z.object({
        title: z.string(),
        amount: z.number(),
        // throw error if type is not income or outcome
        type: z.enum(['income', 'outcome']),
      })

      const { title, type, amount } = createTransactionBody.parse(request.body)

      let sessionId = request.cookies.sessionId

      if (!sessionId) {
        sessionId = randomUUID()
        reply.setCookie('sessionId', sessionId, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 1 week
        })
      }

      await database('transactions').insert({
        id: randomUUID(),
        title,
        amount: type === 'outcome' ? -amount : amount,
        session_id: sessionId,
      })

      return reply.status(201).send({ message: 'created' })
    },
  )
}
