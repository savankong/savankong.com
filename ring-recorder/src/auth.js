// One-time Ring login. Saves the token to DATA_DIR/token.json for the recorder.
// Usage: npm run auth
import readline from 'node:readline'
import path from 'node:path'
import { RingRestClient } from 'ring-client-api/rest-client'
import { TokenStore } from './token-store.js'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: process.stdin.isTTY })
let muted = false
const write = rl._writeToOutput?.bind(rl)
if (write) rl._writeToOutput = (s) => write(muted ? s.replace(/[^\r\n]/g, '*') : s)

const lines = rl[Symbol.asyncIterator]() // buffers lines, so pasted/piped input isn't lost

async function ask(question, { hidden = false } = {}) {
  process.stdout.write(question)
  muted = hidden && process.stdin.isTTY
  const { value = '' } = await lines.next()
  if (muted) process.stdout.write('\n')
  muted = false
  return value.trim()
}

const dataDir = path.resolve(process.env.DATA_DIR || './data')
const email = await ask('Ring email: ')
const password = await ask('Ring password: ', { hidden: true })
const client = new RingRestClient({ email, password })

let auth
try {
  auth = await client.getCurrentAuth()
} catch (err) {
  if (!client.promptFor2fa) {
    console.error(`Login failed: ${err.message}\nCheck the email and password (the same ones you use in the Ring app).`)
    process.exit(1)
  }
  console.log(client.promptFor2fa)
  for (let tries = 0; !auth && tries < 3; tries++) {
    const code = await ask('Verification code: ')
    auth = await client.getAuth(code).catch(() => (console.log('That code did not work, try again.'), null))
  }
  if (!auth) process.exit(1)
}

await new TokenStore(dataDir).save(auth.refresh_token)
console.log(`\nSigned in to Ring. Token saved to ${path.join(dataDir, 'token.json')}`)
process.exit(0)
