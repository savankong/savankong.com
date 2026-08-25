import { Pool } from 'pg'

let _pool: Pool | null = null

function getPool(): Pool {
  if (!_pool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) throw new Error('DATABASE_URL is not set')
    _pool = new Pool({
      connectionString,
      ssl: connectionString.includes('sslmode=disable')
        ? false
        : { rejectUnauthorized: false },
    })
  }
  return _pool
}

export async function sql(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<Record<string, unknown>[]> {
  let text = strings[0]
  for (let i = 0; i < values.length; i++) {
    text += `$${i + 1}${strings[i + 1]}`
  }
  const result = await getPool().query(text, values)
  return result.rows
}
