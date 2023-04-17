import { ExpressContext, UserInputError } from 'apollo-server-express'
import { User } from '../entities'
import { passwordStrength } from 'check-password-strength'
import { EmailTokenType, SigninType } from '../enums'
import { ACCESS_TOKEN_SECRET, SENDGRID_KEY, SG_SENDER } from '../constants'

import sgMail from '@sendgrid/mail'
import * as utils from '../utils'
import * as signInTypeService from './SignInType'
import * as emailTokenService from './EmailToken'
import { verify } from 'jsonwebtoken'


sgMail.setApiKey(`${SENDGRID_KEY}`)


export const register = async (email: string, password: string) => {
  let user = await getUserByEmail(email)
  let isRegUser = null;

  let hashedPassword: string | null = null;

  if (passwordStrength(password).id != 0 && passwordStrength(password).id != 1) {
    hashedPassword = await utils.generatePassword(password)
  } else {
    throw new UserInputError('Password is too weak')
  }

  if (user) {
    isRegUser = await isRegisteredUser(user, SigninType.EMAIL)
    if (!isRegUser) {
      await signInTypeService.createSignInType(email, SigninType.EMAIL);
      return await User.save(Object.assign(user!, { hashedPassword }));
    } else {
      throw new Error("User is already existing");
    }
  }

  const hasSent = await sendConfirmationEmail(email);

  if (hasSent) {
    return await createUser(email, SigninType.EMAIL, hashedPassword)
  } else {
    throw new UserInputError('Signup is unavailable at the moment. Please try again later.')
  }
}

export const login = async (email: string, password: string, ctx: ExpressContext) => {
  let user = await getUserByEmail(email)

  if (!user) {
    throw new UserInputError('User does not exist')
  }

  const hasEmailType = await signInTypeService.hasSignInType(user.email, SigninType.EMAIL);
  if (!hasEmailType) {
    throw new UserInputError('Email login not Available. Please signup to login.')
  }

  if (!user.isVerified) {
    throw new UserInputError('Please verify email')
  }

  let passwordMatched: boolean
  passwordMatched = await utils.comparePassword(password, user.password)
  if (!passwordMatched) {
    throw new UserInputError('Email or Password is incorrect.')
  }

  user.lastLoginTimestamp = new Date()
  await User.save(user)

  ctx.res.cookie('jid', utils.createRefreshToken(user), { httpOnly: true })
  user.accessToken = utils.createAccessToken(user, '1d')

  return user
}

export const getUserByEmail = async (email: string) => {
  return await User.findOne({ where: { email } })
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
export const sendConfirmationEmail = async (email: string) => {
  const randomToken = await emailTokenService.generateUserConfirmationToken(email, EmailTokenType.CONFIRMATION_EMAIL)
  const username = utils.removeEmailAddressesFromString(email)
  const message = utils.generateEmailHTML(username, utils.encryptToken(randomToken))
  const msg: sgMail.MailDataRequired = {
    to: email,
    from: `${SG_SENDER}`,
    subject: 'MoonHoldings Email Confirmation',
    html: message,
  }

  try {
    await sgMail.send(msg)
  } catch (error) {
    console.error(error)
    return false
  }

  return true
}

//NOTE: if resend feature, must check if user is already verified before calling this fn
export const getPasswordResetEmail = async (email: string) => {
  let user = await getUserByEmail(email)

  if (!user) {
    throw new UserInputError('User does not exist')
  } else {
    const randomToken = await emailTokenService.generateUserConfirmationToken(email, EmailTokenType.RESET_PASSWORD)
    const username = utils.removeEmailAddressesFromString(email)
    const message = utils.generatePasswordReset(username, utils.encryptToken(randomToken))
    const msg: sgMail.MailDataRequired = {
      to: email,
      from: `${SG_SENDER}`,
      subject: 'MoonHoldings Password Reset',
      html: message,
    }

    try {
      await sgMail.send(msg)
    } catch (error) {
      console.error(error)
      return false
    }

    return true
  }
}

export const updatePassword = async (password: string, token: string) => {

  if (!token) {
    throw new UserInputError("Not Authenticated");
  }

  let payload: any = null

  try {
    payload = verify(token, ACCESS_TOKEN_SECRET!)
  } catch (err) {
    throw new UserInputError("Invalid token");
  }

  const user = await User.findOne({ where: { id: payload.id } })

  if (!user) {
    throw new UserInputError("User Not found");
  }

  let hashedPassword: string
  if (passwordStrength(password).id == 0 || passwordStrength(password).id == 1) {
    hashedPassword = await utils.generatePassword(password)
  } else {
    throw new UserInputError('Password is too weak')
  }

  await User.save(Object.assign(user, { hashedPassword }))
  return true;
}

export const discordAuth = async (email: string) => {
  const user = await getUserByEmail(email);

  let isRegUser = null;

  if (!user) {
    const hasSent = await sendConfirmationEmail(email)

    if (hasSent) {
      return await createUser(email, SigninType.DISCORD)
    } else {
      throw new UserInputError('Signup is unavailable at the moment. Please try again later.')
    }
  } else {
    isRegUser = await isRegisteredUser(user, SigninType.DISCORD);
  }

  if (!isRegUser) {
    await signInTypeService.createSignInType(user.email, SigninType.DISCORD);
  }

  user.lastLoginTimestamp = new Date()
  await User.save(user)

  return user
}

export const createUser = async (email: string, signInType: string, password?: string | null) => {
  const newUser = new User()
  const generatedUsername = utils.removeEmailAddressesFromString(email)

  newUser.email = email
  newUser.username = generatedUsername

  if (password) {
    newUser.password = password
  }
  signInTypeService.createSignInType(email, signInType);
  return await User.save(newUser)
}

export const isRegisteredUser = async (user: User, signInType: string) => {
  const hasSignInType = await signInTypeService.hasSignInType(user.email, signInType);
  if (hasSignInType) {
    return true;
  }
  else {
    return false;
  }
}

  //TODO: To hold in function
  // async refreshAccessToken({ req, res }: ExpressContext): Promise<string> {

  //    if (!req.cookies.token) {
  //       throw new Error("Token not valid")
  //    }
  //    let payload: any = null

  //    try {
  //       payload = verify(req.cookies.token, process.env.REFRESH_TOKEN_SECRET!);
  //    } catch (err) {
  //       throw new Error("Token not valid")
  //    }

  //    const user = await User.findOne({ where: { id: payload.userId } })

  //    if (!user) {
  //       throw new Error("Token not valid")
  //    }

  //    if (user.tokenVersion != payload.tokenVersion) {
  //       throw new Error("Token not valid")
  //    }

  //    return utils.createAccessToken(user);
  // }

