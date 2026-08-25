import { Pool } from 'pg'

let _pool: Pool | null = null

function getPool(): Pool {
  if (!_pool) {
    const raw = process.env.DATABASE_URL
    if (!raw) throw new Error('DATABASE_URL is not set')

    // pg's connection-string parser overrides an explicit `ssl` option with
    // whatever `sslmode` is in the URL, so a bare `{ rejectUnauthorized: false }`
    // here is silently ignored while `sslmode=require` is present. Strip it and
    // control TLS verification explicitly instead.
    const url = new URL(raw)
    const sslMode = url.searchParams.get('sslmode')
    url.searchParams.delete('sslmode')

    _pool = new Pool({
      connectionString: url.toString(),
      ssl: sslMode === 'disable' ? false : { rejectUnauthorized: false },
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
