import { User } from '../entities'
import { sign } from 'jsonwebtoken'
import { MiddlewareFn } from 'type-graphql'
import { verify } from 'jsonwebtoken'
import { Session } from './session'
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../constants'

import oauth from './discord'
const crypto = require('crypto')

export const createAccessToken = (user: User) => {
  return sign({ userId: user.id }, `${ACCESS_TOKEN_SECRET}`, { expiresIn: '1d' })
}

export const createRefreshToken = (user: User) => {
  return sign({ userId: user.id, tokenVersion: user.tokenVersion }, `${REFRESH_TOKEN_SECRET}`, { expiresIn: '7d' })
}

//Middleware for Authenticated routes
export const isAuth: MiddlewareFn<Session> = ({ context }, next) => {
  const authorization = context.req.headers['authorization']

  if (!authorization) {
    throw new Error('Not Authenticated')
  }

  try {
    const token = authorization.split(' ')[1]
    const payload = verify(token, `${ACCESS_TOKEN_SECRET}`)
    context.payload = payload as any
  } catch (err) {
    console.log(err)
    throw new Error('Not Authenticated')
  }

  return next()
}

export const generateDiscordUrl = () => {
  const url = oauth.generateAuthUrl({
    scope: ['identify', 'email'],
    state: crypto.randomBytes(16).toString('hex'),
  })

  return url
}
