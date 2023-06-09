import { Response } from 'express'
import { User } from '../entities'
import { sign } from 'jsonwebtoken'
import { MiddlewareFn } from 'type-graphql'
import { verify } from 'jsonwebtoken'
import { Session } from './session'
import { ACCESS_TOKEN_SECRET, COOKIE_DOMAIN, REFRESH_TOKEN_SECRET, __prod__ } from '../constants'
import oauth from './discord'
const crypto = require('crypto')

export const createAccessToken = (user: User, expiry: string) => {
  return sign({ userId: user.id, email: user.email }, `${ACCESS_TOKEN_SECRET}`, { expiresIn: expiry })
}

export const createRefreshToken = (user: User) => {
  return sign({ userId: user.id, email: user.email, tokenVersion: user.tokenVersion }, `${REFRESH_TOKEN_SECRET}`, { expiresIn: '30d' })
}

export const setAccessCookie = (res: Response, user: User, cookieType: string, maxAge?: number) => {
  const cookieOptions = {
    httpOnly: true,
    maxAge: maxAge ?? 30 * 24 * 60 * 60 * 1000,
  }

  if (!__prod__) {
    Object.assign(cookieOptions, {
      secure: true,
      sameSite: 'none',
      domain: COOKIE_DOMAIN,
    })
  }

  res.cookie(cookieType, cookieType == 'aid' ? createAccessToken(user, '30d') : createRefreshToken(user), cookieOptions)
}

export const setMessageCookies = (res: Response, message: String, cookieType: string) => {
  const cookieOptions = {
    httpOnly: true,
    maxAge: 3000,
  }

  if (!__prod__) {
    Object.assign(cookieOptions, {
      secure: true,
      sameSite: 'none',
      domain: COOKIE_DOMAIN,
    })
  }

  res.cookie(cookieType, message, cookieOptions)
}

export const setWebflowCookie = (res: Response) => {
  const cookieOptions = {
    maxAge: 30 * 24 * 60 * 60 * 1000,
  }

  if (!__prod__) {
    Object.assign(cookieOptions, {
      domain: COOKIE_DOMAIN,
    })
  }

  res.cookie('wf', 'wf', cookieOptions)
}

//Middleware for Authenticated routes
export const isAuth: MiddlewareFn<Session> = ({ context }, next) => {
  const authorization = context.req.headers['access-token']
  if (!authorization) {
    throw new Error('Not Authenticated')
  }

  const token = (Array.isArray(authorization) ? authorization[0] : authorization).toString().split(' ')[1]

  try {
    const payload = verify(token, `${ACCESS_TOKEN_SECRET}`)
    context.payload = payload as any
  } catch (err) {
    throw new Error('Not Autahenticated')
  }

  return next()
}

export const generateDiscordUrl = async () => {
  const state = crypto.randomBytes(16).toString('hex')

  const url = oauth.generateAuthUrl({
    scope: ['identify', 'email'],
    state: state,
  })

  return url
}
