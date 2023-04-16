import { verify } from 'jsonwebtoken'
import { createAccessToken } from './auth'
import express from 'express'

import { EmailTokenService, UserService } from '../services'
import { Container } from 'typedi'
import { User } from '../entities'
import oauth from './discord'

const router = express.Router()

const emailTokenService = Container.get(EmailTokenService)
const userService = Container.get(UserService)

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

  return res.send({ ok: true, accessToken: createAccessToken(user) })
})

router.get('/verify_email/:token', async (req, res) => {
  const success = await emailTokenService.validateUserToken(req.params.token)
  //TODO CORRECT ROUTING IN FE PAGE
  if (success) {
    return res.status(200).redirect('http://localhost/graphql')
  } else {
    //route somewhere
  }
})

router.get('/auth/discord', async (req, res) => {
  const code = req.query.code as string
  try {
    const accessToken = await oauth.tokenRequest({
      code,
      scope: ['identify', 'email'],
      grantType: 'authorization_code',
    })

    const userInfo = await oauth.getUser(accessToken.access_token)

    if (userInfo.email) {
      const accessToken = await userService.discordAuth(userInfo.email, res)

      if (accessToken) {
        //TODO fix client side url
        res.status(200).redirect(`/dashboard`)
      } else {
        res.status(200).redirect(`/login}`)
      }
    } else {
      res.status(200).json({ error: 'Verify if discord email is confirmed' })
    }
  } catch (error) {
    console.error(error.response)
    res.status(200).json({ error: 'Discord might have maintenance' })
  }
})

export default router
