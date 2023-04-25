import { verify } from 'jsonwebtoken'
import { createRefreshToken } from './auth'
import express from 'express'

import * as emailTokenService from '../services/EmailToken'
import * as userService from '../services/User'
import { User } from '../entities'
import * as utils from '../utils'
import oauth from './discord'
import { memoryCache } from './cache';
import { REFRESH_TOKEN_SECRET, WEBAPP_URL } from '../constants'
import { EmailTokenType } from '../enums'


const router = express.Router()

router.post('/api/refresh_token', async (req, res) => {
  const token = req.cookies.jid
  if (!token) {
    return res.send({ ok: false, message: 'Invalid Token', email: '' })
  }

  let payload: any = null

  try {
    payload = verify(token, REFRESH_TOKEN_SECRET!)
  } catch (err) {
    return res.send({ ok: false, message: 'Invalid Token', accessToken: '' })
  }

  const user = await User.findOne({ where: { id: payload.userId } })

  if (!user) {
    return res.send({ ok: false, message: 'Invalid Token', accessToken: '' })
  }

  if (user.tokenVersion != payload.tokenVersion) {
    return res.send({ ok: false, accessToken: '' })
  }

  res.cookie('aid', utils.createAccessToken(user, '1d'), { httpOnly: true, secure: true, sameSite: 'none', maxAge: 24 * 60 * 60 })
  return res.send({ ok: true, })
})

router.get('/api/verify_email/:token', async (req, res) => {
  try {
    await emailTokenService.validateUserToken(req.params.token, EmailTokenType.CONFIRMATION_EMAIL)
  }
  catch (error) {
    console.log(error)
  }

  return res.status(200).redirect(`${WEBAPP_URL}/login`)
})

router.get('/api/reset_password_callback/:token', async (req, res) => {

  try {
    const user = await emailTokenService.validateUserToken(req.params.token, EmailTokenType.RESET_PASSWORD)

    if (user) {
      res.cookie('jid', utils.createAccessToken(user, '5m'), { httpOnly: true, secure: true, sameSite: 'none', maxAge: 24 * 60 * 60 })
      return res.status(200).redirect(`${WEBAPP_URL}/reset-password`)
    } else {
      return res.status(200).redirect(`${WEBAPP_URL}/login`)
    }
  } catch (error) {
    return res.status(200).redirect(`${WEBAPP_URL}/login`)
  }
})

router.get('/auth/discord', async (req, res) => {
  const code = req.query.code as string
  const state = req.query.state as string
  const value = await memoryCache

  const isValidState = await value.get(state);
  if (!isValidState) {
    return res.status(200).json({ error: 'Authorization link has expired' })
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
          return res.status(200).json({ message: 'Please verify your profile sent via email to login.' })
        }
        res.cookie('jid', createRefreshToken(user), { httpOnly: true, secure: true, sameSite: 'none', maxAge: 24 * 60 * 60 })
        return res.status(200).redirect(`${WEBAPP_URL}/redirect`);
      } else {
        return res.status(200).redirect(`/login`)
      }
    } else {
      return res.status(200).json({ error: 'Verify if discord email is confirmed' })
    }
  } catch (error) {
    return res.status(200).json({ error: 'Discord might have maintenance' })
  }
})



export default router
