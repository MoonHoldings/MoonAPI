import { verify } from 'jsonwebtoken'
import express from 'express'

import * as emailTokenService from '../services/EmailToken'
import * as userService from '../services/User'
import * as portfolioService from '../services/Porfolio'
import { User } from '../entities'
import * as utils from '../utils'
import oauth from './discord'
// import { memoryCache } from './cache'
import { REFRESH_TOKEN_SECRET, WEBAPP_URL, COINBASE_CLIENT, COINBASE_SECRET, COINBASE_URL, SERVER_URL, GEMINI_CLIENT, GEMINI_URL, GEMINI_SECRET, GEMINI_OAUTH_URL } from '../constants'
import { EmailTokenType } from '../enums'
import axios from 'axios'
import { PYTH_COINS } from './pythCoins'
import { CoinData, ExchangeInfo } from '../types'
import decrypt from './decrypt'
const router = express.Router()

router.post('/api/refresh_token', async (req, res) => {
  const token = req.cookies.jid
  if (!token) {
    return res.send({ ok: false, message: 'Invalid Token' })
  }

  let payload: any = null

  try {
    payload = verify(token, REFRESH_TOKEN_SECRET!)
  } catch (err) {
    return res.send({ ok: false, message: 'Invalid Token' })
  }

  const user = await User.findOne({ where: { id: payload.userId } })

  if (!user) {
    return res.send({ ok: false, message: 'Invalid Token' })
  }

  if (user.tokenVersion != payload.tokenVersion) {
    return res.send({ ok: false })
  }

  const accessToken = utils.createAccessToken(user, '30d')
  utils.setWebflowCookie(res)
  return res.send({ ok: true, username: user.username, access_token: accessToken })
})

router.get('/api/verify_email/:token', async (req, res) => {
  try {
    await emailTokenService.validateUserToken(req.params.token, EmailTokenType.CONFIRMATION_EMAIL)
  } catch (error) {
    utils.setMessageCookies(res, error.message, 'error')
    return res.status(200).redirect(`${WEBAPP_URL}/login`)
  }

  utils.setMessageCookies(res, 'You have successfully verified your email', 'message')
  return res.status(200).redirect(`${WEBAPP_URL}/login`)
})

router.get('/api/reset_password_callback/:token', async (req, res) => {
  try {
    const user = await emailTokenService.validateUserToken(req.params.token, EmailTokenType.RESET_PASSWORD)

    if (user) {
      utils.setAccessCookie(res, user, 'jid', 300000)
      return res.status(200).redirect(`${WEBAPP_URL}/reset-password`)
    } else {
      return res.status(200).redirect(`${WEBAPP_URL}/login`)
    }
  } catch (error) {
    res.clearCookie('jid')
    utils.setMessageCookies(res, error.message, 'error')
    return res.status(200).redirect(`${WEBAPP_URL}/login`)
  }
})

router.get('/auth/discord', async (req, res) => {
  const code = req.query.code as string
  const error = req.query.error as string

  if (error === 'access_denied') {
    utils.setMessageCookies(res, 'You have cancelled the login', 'message')
    return res.status(200).redirect(`${WEBAPP_URL}/redirect`)
  }

  try {
    const accessToken = await oauth.tokenRequest({
      code,
      scope: ['identify', 'email'],
      grantType: 'authorization_code',
    })

    const userInfo = await oauth.getUser(accessToken.access_token)

    if (userInfo.email) {
      const user = await userService.discordAuth(userInfo.email)
      if (user) {
        if (!user.isVerified) {
          utils.setMessageCookies(res, `Please verify your profile sent to your email to login.`, 'message')
          utils.setMessageCookies(res, userInfo.email, 'email')
          return res.status(200).redirect(`${WEBAPP_URL}/redirect`)
        }
        utils.setAccessCookie(res, user, 'jid')
        return res.status(200).redirect(`${WEBAPP_URL}/redirect`)
      } else {
        utils.setMessageCookies(res, 'User is not found', 'message')
        return res.status(400).redirect(`${WEBAPP_URL}/redirect`)
      }
    } else {
      utils.setMessageCookies(res, 'Please check to see if your discord account has an email.', 'message')
      return res.status(200).redirect(`${WEBAPP_URL}/redirect`)
    }
  } catch (error) {
    utils.setMessageCookies(res, error.message, 'message')
    return res.status(400).redirect(`${WEBAPP_URL}/redirect`)
  }
})

router.get('/auth/coinbase', async (req, res) => {
  const code = req.query.code as string
  const state = req.query.state as string

  const [key, id] = decrypt(state)?.split(' ')

  if (key !== 'HELLOMOON' && id == null && typeof id !== 'number' && state === null && code === null) {
    return res.status(400).redirect(`${WEBAPP_URL}/redirect`)
  }

  const { data }: { data: any } = await axios.post(`${COINBASE_URL}/oauth/token`, {
    grant_type: 'authorization_code',
    code: code,
    client_id: `${COINBASE_CLIENT}`,
    client_secret: `${COINBASE_SECRET}`,
    redirect_uri: `${SERVER_URL}/auth/coinbase`,
  })
  const token = data.access_token

  const getUserPromise = axios.get(`${COINBASE_URL}/v2/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const getAccountsPromise = axios.get(`${COINBASE_URL}/v2/accounts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const [userData, accountsData] = await Promise.all([getUserPromise, getAccountsPromise])

  const { data: userDataResponse }: { data: any } = userData
  const { data: accountsDataResponse }: { data: any } = accountsData

  const userId = userDataResponse.data.id
  const filteredCoins = accountsDataResponse.data.filter((item: any) => PYTH_COINS.find((pythCoin) => pythCoin.symbol === item.balance.currency))
  const newCoins: CoinData[] = []
  filteredCoins.forEach((coinbaseCoin: any) =>
    newCoins.push({
      name: coinbaseCoin.balance.currency,
      symbol: coinbaseCoin.balance.currency,
      walletName: 'Coinbase',
      type: 'Auto',
      walletAddress: userId,
      holdings: parseFloat(coinbaseCoin.balance.amount),
    } as CoinData)
  )

  if (newCoins.length > 0) {
    const exchangeInfo = new ExchangeInfo()
    exchangeInfo.coinData = newCoins
    exchangeInfo.walletName = 'Coinbase'
    exchangeInfo.walletAddress = userId
    portfolioService.addExchangeCoins(exchangeInfo, id)
    utils.setMessageCookies(res, `You have successfully linked your Coinbase`, 'message')
    return res.status(200).redirect(`${WEBAPP_URL}/redirect`)
  }
  utils.setMessageCookies(res, `You have successfully linked your Coinbase`, 'error')
  return res.status(200).redirect(`${WEBAPP_URL}/redirect`)
})

router.get('/auth/gemini', async (req, res) => {
  const code = req.query.code as string
  const state = req.query.state as string

  const [key, id] = decrypt(state)?.split(' ')

  if (key !== 'HELLOMOON' && id == null && typeof id !== 'number' && state === null && code === null) {
    return res.status(200).redirect(`${WEBAPP_URL}/redirect`)
  }

  const { data }: { data: any } = await axios.post(`${GEMINI_OAUTH_URL}/auth/token`, {
    grant_type: 'authorization_code',
    code: code,
    client_id: `${GEMINI_CLIENT}`,
    client_secret: `${GEMINI_SECRET}`,
    redirect_uri: `${SERVER_URL}/auth/gemini`,
  })

  const token = data?.access_token

  try {
    const getAccountsPromise = axios.post(
      `${GEMINI_URL}/v1/balances`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const [accountsData] = await Promise.all([getAccountsPromise])
    const { data: accountsDataResponse }: { data: any } = accountsData
    const filteredCoins = accountsDataResponse.filter((item: any) => PYTH_COINS.find((pythCoin) => pythCoin.symbol === item.currency))
    const newCoins: CoinData[] = []

    filteredCoins.forEach((geminiCoin: any) =>
      newCoins.push({
        name: geminiCoin.currency,
        symbol: geminiCoin.currency,
        walletName: 'Gemini',
        type: 'Auto',
        walletAddress: `GEMINI_${id}`,
        holdings: parseFloat(geminiCoin.available),
      } as CoinData)
    )

    if (newCoins.length > 0) {
      const exchangeInfo = new ExchangeInfo()
      exchangeInfo.coinData = newCoins
      exchangeInfo.walletName = 'Gemini'
      exchangeInfo.walletAddress = `GEMINI_${id}`
      portfolioService.addExchangeCoins(exchangeInfo, id)
      utils.setMessageCookies(res, `You have successfully linked your Coinbase`, 'message')
      return res.status(200).redirect(`${WEBAPP_URL}/redirect`)
    }
  } catch (error) {
    return res.status(404).send(`
    <html>
      <head>
        <title>503 ${error.message}Message</title>
      </head>
    </html>
  `)
  }
  return res.status(200).redirect(`${WEBAPP_URL}/redirect`)
})

router.get('/health_check', (_req, res) => {
  res.status(200).send('OK')
})

export default router
