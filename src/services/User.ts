import { ExpressContext, UserInputError } from 'apollo-server-express'
import { User } from '../entities'

import { EmailTokenType, SignInType } from '../enums'
import { REFRESH_TOKEN_SECRET, SENDGRID_KEY, SG_SENDER } from '../constants'

import sgMail from '@sendgrid/mail'
import * as utils from '../utils'
import * as signInTypeService from './SignInType'
import * as emailTokenService from './EmailToken'
import { verify } from 'jsonwebtoken'
import { generateUsername } from './Username'

sgMail.setApiKey(`${SENDGRID_KEY}`)

export const register = async (email: string, password: string) => {
  let user = await getUserByEmail(email)
  let isRegUser = null

  let hashedPassword: string | null = null

  if (!utils.isValidEmail(email)) {
    throw new UserInputError('Please enter a valid email')
  }

  if (!password) {
    throw new UserInputError('Please enter a valid password')
  }

  hashedPassword = await utils.generatePassword(password)

  if (user) {
    isRegUser = await isRegisteredUser(user, SignInType.EMAIL)
    if (!isRegUser) {
      await signInTypeService.createSignInType(email, SignInType.EMAIL)
      return await User.save(Object.assign(user, { password: hashedPassword }))
    } else {
      throw new Error('Email already registered.')
    }
  }
  const username = await generateUsername()
  const hasSent = await sendConfirmationEmail(email, username)

  if (hasSent) {
    const user = await createUser(email, SignInType.EMAIL, username, hashedPassword)
    await signInTypeService.createSignInType(email, SignInType.EMAIL)
    return user
  } else {
    throw new UserInputError('Signup is unavailable at the moment. Please try again later.')
  }
}

export const login = async (email: string, password: string, ctx: ExpressContext) => {
  const user = await getUserByEmail(email)

  if (!user) {
    throw new UserInputError('User does not exist')
  }

  if (user.isLocked) {
    const isUnlocked = await user.checkToUnlock()
    if (!isUnlocked) throw new UserInputError('You are locked out please try again after 5 minutes.')
  }

  let passwordMatched: boolean
  passwordMatched = await utils.comparePassword(password, user.password)
  if (!passwordMatched) {
    await user.incrementFailedAttempts()
    throw new UserInputError('Incorrect credentials.')
  }

  const hasEmailType = await signInTypeService.hasSignInType(user.email, SignInType.EMAIL)
  if (!hasEmailType) {
    throw new UserInputError('Incorrect credentials.')
  }

  if (!user.isVerified) {
    throw new UserInputError('Please verify your profile sent via email to login.')
  }

  user.lastLoginTimestamp = new Date()
  await User.save(user)

  utils.setAccessCookie(ctx.res, user, 'jid')
  utils.setAccessCookie(ctx.res, user, 'aid')
  utils.setWebflowCookie(ctx.res)
  return user
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return await User.findOne({ where: { email } })
}

export const getUserById = async (id: number): Promise<User | null> => {
  return await User.findOne({ where: { id } })
}

//to invalidate refresh token
export const incrementRefreshVersion = async (id: number) => {
  try {
    await User.incrementTokenVersion(id)
  } catch (err) {
    console.log(err)
  }
}

//NOTE: if resend feature, must check if user is already verified before calling this fn
export const sendConfirmationEmail = async (email: string, username: string) => {
  await emailTokenService.isLocked(email, EmailTokenType.CONFIRMATION_EMAIL)

  const token = utils.generateRandomString(32)
  const message = utils.generateEmailHTML(username, utils.encryptToken(token))
  const msg: sgMail.MailDataRequired = {
    to: email,
    from: `${SG_SENDER}`,
    subject: 'MoonHoldings Email Confirmation',
    html: message,
  }

  try {
    const res = await sgMail.send(msg)
    if (res[0].statusCode == 202) {
      await emailTokenService.generateUserConfirmationToken(email, EmailTokenType.CONFIRMATION_EMAIL, token)
    } else {
      throw new UserInputError("Email was not sent please try again later.")
    }
  } catch (error) {
    throw new UserInputError(error.message)
  }

  return true
}

export const resendEmailConfrmation = async (email: string) => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new UserInputError("User is not found.")
  }
  return await sendConfirmationEmail(user.email, user.username)

}

export const getPasswordResetEmail = async (email: string) => {
  if (!utils.isValidEmail(email)) {
    throw new UserInputError('Please enter a valid email.')
  }

  let user = await getUserByEmail(email)

  if (!user) {
    throw new UserInputError('User does not exist.')
  } else {
    if (!user.isVerified) {
      throw new UserInputError('Please verify your email to reset your password')
    }

    if (!user.password) {
      throw new UserInputError('Please signup using this email first to register a password.')
    }

    await emailTokenService.isLocked(email, EmailTokenType.RESET_PASSWORD)

    const token = utils.generateRandomString(32)
    const message = utils.generatePasswordReset(user.username, utils.encryptToken(token))
    const msg: sgMail.MailDataRequired = {
      to: email,
      from: `${SG_SENDER}`,
      subject: 'MoonHoldings Password Reset',
      html: message,
    }

    try {
      const res = await sgMail.send(msg)
      if (res[0].statusCode == 202) {
        await emailTokenService.generateUserConfirmationToken(email, EmailTokenType.RESET_PASSWORD, token)
      } else {
        throw new UserInputError("Email was not sent please try again later.")
      }
    } catch (error) {
      throw new UserInputError(error.message)
    }

    return true
  }
}

export const updatePassword = async (password: string, token: string) => {
  if (!token) {
    throw new UserInputError('Too too long to reset password - please reset again')
  }

  let payload: any = null

  try {
    payload = verify(token, REFRESH_TOKEN_SECRET!)
  } catch (err) {
    throw new UserInputError('Invalid token')
  }

  const user = await User.findOne({ where: { id: payload.userId } })

  if (!user) {
    throw new UserInputError('User Not found')
  }

  if (!password) {
    throw new UserInputError('Please provide a valid password')
  }

  const hashedPassword = await utils.generatePassword(password)

  if (user.password) {
    let passwordMatched: boolean
    passwordMatched = await utils.comparePassword(password, user.password)
    if (passwordMatched) {
      throw new UserInputError('Please use a different password.')
    }
  }

  await User.save(Object.assign(user, { password: hashedPassword }))
  return true
}

export const discordAuth = async (email: string) => {
  const user = await getUserByEmail(email)

  let isRegUser = null

  if (!user) {
    const username = await generateUsername()
    const hasSent = await sendConfirmationEmail(email, username)

    if (hasSent) {
      return await createUser(email, SignInType.DISCORD, username)
    } else {
      throw new UserInputError('Signup is unavailable at the moment. Please try again later.')
    }
  } else {
    isRegUser = await isRegisteredUser(user, SignInType.DISCORD)
  }

  if (!isRegUser) {
    await signInTypeService.createSignInType(user.email, SignInType.DISCORD)
  }

  user.lastLoginTimestamp = new Date()
  await User.save(user)

  return user
}

export const createUser = async (email: string, signInType: string, username: string, password?: string | null) => {
  const newUser = new User()

  newUser.email = email
  newUser.username = username

  if (password) {
    newUser.password = password
  }
  signInTypeService.createSignInType(email, signInType)
  return await User.save(newUser)
}

export const isRegisteredUser = async (user: User, signInType: string) => {
  const hasSignInType = await signInTypeService.hasSignInType(user.email, signInType)
  if (hasSignInType) {
    return true
  } else {
    return false
  }
}
