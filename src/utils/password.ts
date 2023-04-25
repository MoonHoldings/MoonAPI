import { hash, compare } from 'bcrypt'
import * as crypto from 'crypto'
import { EMAIL_TOKEN_SECRET } from '../constants'

export const comparePassword = async (password: string, hashedPassword: string) => {
  return await compare(password, hashedPassword)
}

export const generatePassword = async (password: string) => {
  return await hash(password, 10)
}

export const encryptToken = (token: string) => {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', `${EMAIL_TOKEN_SECRET}`, iv)
  let encrypted = cipher.update(token, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

export const decryptToken = (token: string) => {
  const parts = token.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encrypted = Buffer.from(parts[1], 'hex')
  const decipher = crypto.createDecipheriv('aes-256-cbc', `${EMAIL_TOKEN_SECRET}`, iv)
  let decrypted = decipher.update(encrypted)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString('utf8')
}
