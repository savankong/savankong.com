import fs from 'node:fs/promises'
import path from 'node:path'

// Ring rotates the refresh token (and stores push-notification credentials in
// it). It must be saved every time it changes, or the next restart can't log in.
export class TokenStore {
  constructor(dataDir) {
    this.file = path.join(dataDir, 'token.json')
  }

  async load() {
    try {
      const { refreshToken } = JSON.parse(await fs.readFile(this.file, 'utf8'))
      return refreshToken || null
    } catch (err) {
      if (err.code === 'ENOENT') return null
      throw err
    }
  }

  async save(refreshToken) {
    await fs.mkdir(path.dirname(this.file), { recursive: true })
    const tmp = `${this.file}.tmp`
    await fs.writeFile(tmp, JSON.stringify({ refreshToken, updatedAt: new Date().toISOString() }), {
      mode: 0o600,
    })
    await fs.rename(tmp, this.file)
  }
}
