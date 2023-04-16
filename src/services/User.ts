import { ExpressContext, UserInputError } from 'apollo-server-express'
import { User } from '../entities'
import Container, { Service } from 'typedi'

import { passwordStrength } from 'check-password-strength'
import { SignupType } from '../enums'
import { EmailTokenService } from './EmailToken'
import { SENDGRID_KEY, SG_SENDER } from '../constants'

import sgMail from '@sendgrid/mail'
import * as utils from '../utils'
import { Response } from 'express'

@Service()
export class UserService {
  private emailTokenService = Container.get(EmailTokenService)

  constructor() {
    sgMail.setApiKey(`${SENDGRID_KEY}`)
  }

  async register(email: string, password: string): Promise<User> {
    let user = await this.getUserByEmail(email)

    if (user) {
      throw new UserInputError('User exists')
    }

    let hashedPassword: string
    if (passwordStrength(password).id != 0 || passwordStrength(password).id != 1) hashedPassword = await utils.generatePassword(password)
    else {
      throw new UserInputError('Password is too weak')
    }

    const hasSent = await this.sendConfirmationEmail(email)

    if (hasSent) {
      return await this.createUser(email, SignupType.EMAIL, hashedPassword)
    } else {
      throw new UserInputError('Signup is unavailable at the moment. Please try again later.')
    }
  }

  async login(email: string, password: string, ctx: ExpressContext): Promise<User> {
    let user = await this.getUserByEmail(email)

    if (!user) {
      throw new UserInputError('User does not exists')
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
    const randomToken = await this.emailTokenService.generateUserConfirmationToken(email)
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

  async discordAuth(email: string, res: Response): Promise<boolean | null> {
    const user = await this.getUserByEmail(email)
    let token = null

    if (!user) {
      const hasSent = await this.sendConfirmationEmail(email)
      if (hasSent) {
        await this.createUser(email, SignupType.DISCORD)
        token = true
      } else {
        throw new Error('There is an issue with our email servers. Please try again later.')
      }
    } else {
      res.cookie('jid', utils.createRefreshToken(user), { httpOnly: true })
    }

    return token
  }

  async createUser(email: string, signupType: string, password?: string): Promise<User> {
    const newUser = new User()
    const generatedUsername = utils.removeEmailAddressesFromString(email)

    newUser.email = email
    newUser.username = generatedUsername
    newUser.signupType = signupType

    if (password) {
      newUser.password = password
    }

    return User.save(newUser)
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
