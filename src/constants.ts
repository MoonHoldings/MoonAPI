import dotenv from 'dotenv'
dotenv.config()

export const __prod__ = process.env.NODE_ENV !== 'production'
export const RPC_URL = process.env.RPC_URL
export const HELLO_MOON_RPC_URL = process.env.HELLO_MOON_RPC_URL
export const HELLO_MOON_URL = `${process.env.HELLO_MOON_SERVER_URL}`
export const HELLO_MOON_KEY = `${process.env.HELLO_MOON_KEY}`
export const SHYFT_URL = `${process.env.SHYFT_SERVER_URL}`
export const SHYFT_KEY = `${process.env.SHYFT_KEY}`
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET
export const SENDGRID_KEY = process.env.SENDGRID_KEY
export const SG_SENDER = process.env.SG_SENDER
export const EMAIL_EXPIRY_IN_DAYS = parseInt(process.env.EMAIL_EXPIRY_IN_DAYS!, 10)
export const EMAIL_TOKEN_SECRET = process.env.EMAIL_TOKEN_SECRET
export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
export const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET
export const SERVER_URL = process.env.SERVER_URL
export const WEBAPP_URL = process.env.WEBAPP_URL
export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN
export const CRYPTO_SECRET = process.env.CRYPTO_SECRET

export const AXIOS_CONFIG_SHYFT_KEY = {
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': SHYFT_KEY,
  },
}
export const AXIOS_CONFIG_HELLO_MOON_KEY = {
  headers: {
    Authorization: `Bearer ${HELLO_MOON_KEY}`,
  },
}
