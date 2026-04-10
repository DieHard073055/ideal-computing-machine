import crypto from 'crypto'

function getKey(): Buffer {
  return crypto.createHash('sha256').update(process.env.APP_SECRET!).digest()
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const key = getKey()
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return `${iv.toString('hex')}:${encrypted}`
}

export function decrypt(stored: string): string {
  const [ivHex, ciphertext] = stored.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const key = getKey()
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  let decrypted = decipher.update(ciphertext, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
