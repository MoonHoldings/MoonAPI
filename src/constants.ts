import dotenv from "dotenv"
dotenv.config()

export const __prod__ = process.env.NODE_ENV !== "production"
export const RPC_URL = process.env.RPC_URL
export const HELLO_MOON_RPC_URL = process.env.HELLO_MOON_RPC_URL
export const HELLO_MOON_URL = `${process.env.HELLO_MOON_SERVER_URL}`
export const HELLO_MOON_KEY = `${process.env.HELLO_MOON_KEY}`
export const SHYFT_URL = `${process.env.SHYFT_SERVER_URL}`
export const SHYFT_KEY = `${process.env.SHYFT_KEY}`
export const AXIOS_CONFIG_SHYFT_KEY = {
  headers: {
    "Content-Type": "application/json",
    "x-api-key": SHYFT_KEY,
  },
}
export const AXIOS_CONFIG_HELLO_MOON_KEY = {
  headers: {
    Authorization: `Bearer ${HELLO_MOON_KEY}`,
  },
}
