import { verify } from 'jsonwebtoken'
import express from 'express'

import * as emailTokenService from '../services/EmailToken'
import * as userService from '../services/User'
import { User } from '../entities'
import * as utils from '../utils'
import oauth from './discord'
// import { memoryCache } from './cache'
import { REFRESH_TOKEN_SECRET, WEBAPP_URL } from '../constants'
import { EmailTokenType } from '../enums'

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

  utils.setAccessCookie(res, user, 'aid')
  utils.setWebflowCookie(res)
  return res.send({ ok: true, username: user.username })
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

router.get('/health_check', (_req, res) => {
  res.status(200).send('OK')
})

export default router
