import { ExpressContext, UserInputError } from 'apollo-server-express'
import { User } from '../entities'
import Container, { Service } from 'typedi'

import { passwordStrength } from 'check-password-strength'
import { EmailTokenType, SigninType } from '../enums'
import { EmailTokenService } from './EmailToken'
import { SENDGRID_KEY, SG_SENDER } from '../constants'

import sgMail from '@sendgrid/mail'
import * as utils from '../utils'
import { Response } from 'express'

import { verify } from 'jsonwebtoken'
import { SigninTypeService } from './SigninType'

@Service()
export class UserService {
  private emailTokenService = Container.get(EmailTokenService)
  private signinTypeService = Container.get(SigninTypeService);

  constructor() {
    sgMail.setApiKey(`${SENDGRID_KEY}`)
  }

  async register(email: string, password: string): Promise<User> {
    let user = await this.getUserByEmail(email)
    let isRegisteredUser = null;

    let hashedPassword: string | null = null;

    if (passwordStrength(password).id != 0 && passwordStrength(password).id != 1) {
      hashedPassword = await utils.generatePassword(password)
    } else {
      throw new UserInputError('Password is too weak')
    }

    if (user) {
      isRegisteredUser = await this.isRegisteredUser(user, SigninType.EMAIL)
      if (!isRegisteredUser) {
        await this.signinTypeService.createSigninType(email, SigninType.EMAIL);
        return await User.save(Object.assign(user!, { hashedPassword }));
      } else {
        throw new Error("User is already existing");
      }
    }

    const hasSent = true

    if (hasSent) {
      return await this.createUser(email, SigninType.EMAIL, hashedPassword)
    } else {
      throw new UserInputError('Signup is unavailable at the moment. Please try again later.')
    }
  }

  async login(email: string, password: string, ctx: ExpressContext): Promise<User> {
    let user = await this.getUserByEmail(email)

    if (!user) {
      throw new UserInputError('User does not exist')
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
    User.save(user)

    ctx.res.cookie('jid', utils.createRefreshToken(user), { httpOnly: true })
    user.accessToken = utils.createAccessToken(user)

    return user
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } })
  }

  //to invalidate refresh token
  async incrementRefreshVersion(id: number): Promise<void> {
    try {
      User.incrementTokenVersion(id)
    } catch (err) {
      console.log(err)
    }
  }

  //NOTE: if resend feature, must check if user is already verified before calling this fn
  async sendConfirmationEmail(email: string): Promise<boolean> {
    const randomToken = await this.emailTokenService.generateUserConfirmationToken(email, EmailTokenType.CONFIRMATION_EMAIL)
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
  async getPasswordResetEmail(email: string): Promise<boolean> {
    let user = await this.getUserByEmail(email)

    if (!user) {
      throw new UserInputError('User does not exist')
    } else {
      const randomToken = await this.emailTokenService.generateUserConfirmationToken(email, EmailTokenType.RESET_PASSWORD)
      const username = utils.removeEmailAddressesFromString(email)
      const message = utils.generateEmailHTML(username, utils.encryptToken(randomToken))
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

  async updatePassword(password: string, token: string): Promise<boolean> {

    if (!token) {
      throw new UserInputError("Not Authenticated");
    }

    let payload: any = null

    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET!)
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

  async discordAuth(email: string, res: Response): Promise<User | null> {
    const user = await this.getUserByEmail(email);

    let isRegisteredUser = null;

    if (!user) {
      const hasSent = await this.sendConfirmationEmail(email)

      if (hasSent) {
        return await this.createUser(email, SigninType.DISCORD)
      } else {
        throw new UserInputError('Signup is unavailable at the moment. Please try again later.')
      }
    } else {
      isRegisteredUser = await this.isRegisteredUser(user, SigninType.DISCORD);
    }

    if (!isRegisteredUser) {
      await this.signinTypeService.createSigninType(user.email, SigninType.DISCORD);
    }

    return user
  }

  async createUser(email: string, signupType: string, password?: string | null): Promise<User> {
    const newUser = new User()
    const generatedUsername = utils.removeEmailAddressesFromString(email)

    newUser.email = email
    newUser.username = generatedUsername
    newUser.signupType = signupType

    if (password) {
      newUser.password = password
    }
    this.signinTypeService.createSigninType(email, signupType);
    return User.save(newUser)
  }

  async isRegisteredUser(user: User, signupType: string): Promise<boolean> {
    const hasSignupType = await this.signinTypeService.hasSigninType(user.email, signupType);
    if (hasSignupType) {
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
}
