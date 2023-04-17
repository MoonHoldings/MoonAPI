import { verify } from 'jsonwebtoken'
import { createAccessToken } from './auth'
import express from 'express'

import * as emailTokenService from '../services/EmailToken'
import * as userService from '../services/User'
import { User } from '../entities'
import * as utils from '../utils'
import oauth from './discord'
import { memoryCache } from './cache';


const router = express.Router()

router.post('/refresh_token', async (req, res) => {
  const token = req.cookies.jid

  if (!token) {
    return res.send({ ok: false, accessToken: '' })
  }

  let payload: any = null

  try {
    payload = verify(token, process.env.REFRESH_TOKEN_SECRET!)
  } catch (err) {
    return res.send({ ok: false, accessToken: '' })
  }

  const user = await User.findOne({ where: { id: payload.userId } })

  if (!user) {
    return res.send({ ok: false, accessToken: '' })
  }

  if (user.tokenVersion != payload.tokenVersion) {
    return res.send({ ok: false, accessToken: '' })
  }

  return res.send({ ok: true, accessToken: createAccessToken(user, '1d') })
})

router.get('/verify_email/:token', async (req, res) => {
  const success = await emailTokenService.validateUserToken(req.params.token)
  console.log(success);
  //TODO CORRECT ROUTING IN FE PAGE login page
  if (success) {
    return res.status(200).redirect('http://localhost/graphql')
  } else {
    //route somewhere
  }
})

router.get('/reset_password_callback/:token', async (req, res) => {
  const success = await emailTokenService.validateUserToken(req.params.token)
  //TODO CORRECT ROUTING IN FE PAGE update password UI
  if (success) {
    res.cookie('jid', utils.createAccessToken(success, '5m'), { httpOnly: true })
    return res.status(200).redirect('http://localhost/graphql')
  } else {
    //route somewhere
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

      if (!user?.isVerified) {
        return res.status(200).json({ error: 'Your email has been linked to your discord profile. Please verify your email to login.' })
      }
      if (user) {
        //TODO fix client side url
        return res.send({ ok: true, accessToken: createAccessToken(user, '1d') })
      } else {
        return res.status(200).redirect(`/login`)
      }
    } else {
      return res.status(200).json({ error: 'Verify if discord email is confirmed' })
    }
  } catch (error) {
    console.error(error)
    return res.status(200).json({ error: 'Discord might have maintenance' })
  }
})



export default router
