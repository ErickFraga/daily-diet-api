import { knex } from 'knex'

export const database = knex({
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: './tmp/db.sqlite',
  },
})
