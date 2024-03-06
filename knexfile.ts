import { Knex } from 'knex'
import { env } from './src/env'

const connection =
  env.DATABASE_CLIENT === 'pg'
    ? env.DATABASE_URL
    : { filename: env.DATABASE_CLIENT }

const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  useNullAsDefault: true,
  connection,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}

export default config
