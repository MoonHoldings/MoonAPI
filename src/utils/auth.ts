import { User } from '../entities'
import { sign } from 'jsonwebtoken'
import { MiddlewareFn } from 'type-graphql'
import { verify } from 'jsonwebtoken'
import { Session } from './session'
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../constants'

import oauth from './discord'
const crypto = require('crypto')

import { memoryCache } from './cache';

export const createAccessToken = (user: User, expiry: string) => {
  return sign({ userId: user.id, email: user.email }, `${ACCESS_TOKEN_SECRET}`, { expiresIn: expiry })
}

export const createRefreshToken = (user: User) => {
  return sign({ userId: user.id, email: user.email, tokenVersion: user.tokenVersion }, `${REFRESH_TOKEN_SECRET}`, { expiresIn: '7d' })
}

//Middleware for Authenticated routes
export const isAuth: MiddlewareFn<Session> = ({ context }, next) => {
  const authorization = context.req.cookies.aid

  if (!authorization) {
    throw new Error('Not Authenticated')
  }

  try {
    const token = authorization.split(' ')[1]
    const payload = verify(token, `${ACCESS_TOKEN_SECRET}`)
    context.payload = payload as any
  } catch (err) {
    throw new Error('Not Authenticated')
  }

  return next()
}

export const generateDiscordUrl = async () => {
  const state = crypto.randomBytes(16).toString('hex');

  const cache = await memoryCache;

  await cache.set(state, 60000);
  const url = oauth.generateAuthUrl({
    scope: ['identify', 'email'],
    state: state,
  })

  return url
}
