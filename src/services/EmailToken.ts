import { generateRandomString } from '../utils/string'
import { EmailToken, User } from '../entities'
import { EMAIL_EXPIRY_IN_DAYS } from '../constants'
import * as utils from '../utils'
import { add, addMinutes, isAfter } from 'date-fns'
import { EmailTokenType } from '../enums'
import { UserInputError } from 'apollo-server-express'


const MAX_EMAIL_TOKEN_ATTEMPTS = 3
const EMAIL_TOKEN_LOCKOUT_SECONDS = 10

export const generateUserConfirmationToken = async (email: string, type: string, token: string) => {
  const emailToken = await EmailToken.findOne({ where: { email, emailTokenType: type } })
  const now = new Date()

  if (emailToken) {
    if (emailToken.isExpired()) {
      await EmailToken.save(
        Object.assign(emailToken, {
          token: token,
          generatedAt: now,
          expireAt: add(now, { days: EMAIL_EXPIRY_IN_DAYS }),
        })
      )
    }
    else {
      const originalDate = new Date()
      const lockoutThresholdTime = addMinutes(emailToken.generatedAt, EMAIL_TOKEN_LOCKOUT_SECONDS)
      const attempts = emailToken.attempts;

      if (isAfter(lockoutThresholdTime, originalDate)) {
        if (attempts <= MAX_EMAIL_TOKEN_ATTEMPTS) {
          await EmailToken.save(
            Object.assign(emailToken, {
              token: token,
              generatedAt: now,
              expireAt: add(now, { days: EMAIL_EXPIRY_IN_DAYS }),
              attempts: attempts + 1
            })
          )
        } else {
          throw new UserInputError('You have requested to many times. Please try again later.')
        }

      } else {
        await EmailToken.save(
          Object.assign(emailToken, {
            token: token,
            generatedAt: now,
            expireAt: add(now, { days: EMAIL_EXPIRY_IN_DAYS }),
            attempts: 1
          })
        )
      }
    }
  } else {
    await EmailToken.save({
      email: email,
      token: token,
      generatedAt: now,
      expireAt: add(now, { days: EMAIL_EXPIRY_IN_DAYS }),
      emailTokenType: type
    })
  }

  return token
}

export const validateUserToken = async (hashedToked: string, type: string) => {
  if (!hashedToked) {
    throw new UserInputError('Invalid Token.')
  }
  const token = utils.decryptToken(utils.removedKey(hashedToked))
  const emailToken = await EmailToken.findOne({ where: { token, emailTokenType: type } })

  if (!emailToken) {
    throw new UserInputError('Invalid Token.')
  }
  if (emailToken.isExpired()) {
    throw new UserInputError('Expired Token.')
  }

  const user = await User.findOne({ where: { email: emailToken.email } })
  if (!user) {
    throw new UserInputError('User not found.')
  }

  if (emailToken.emailTokenType == EmailTokenType.CONFIRMATION_EMAIL) {
    if (user.isVerified) {
      throw new UserInputError('User is already verified.')
    } else {
      return await User.save(
        Object.assign(user, {
          isVerified: true,
          verifiedAt: new Date(),
        })
      )
    }
  }
  else {
    if (!user.isVerified) {
      throw new UserInputError('Please be verified to reset password')
    }
    await EmailToken.save(
      Object.assign(emailToken, {
        expireAt: new Date(),
      })
    )
    return user;
  }
}


export const isLocked = async (email: string, type: string) => {
  const emailToken = await EmailToken.findOne({ where: { email, emailTokenType: type } })

  if (emailToken) {
    if (emailToken.isExpired()) {
      return false
    }
    else {
      const originalDate = new Date()
      const lockoutThresholdTime = addMinutes(emailToken.generatedAt, EMAIL_TOKEN_LOCKOUT_SECONDS)
      const attempts = emailToken.attempts;

      if (isAfter(lockoutThresholdTime, originalDate)) {
        if (attempts <= MAX_EMAIL_TOKEN_ATTEMPTS) {
          return false
        } else {
          throw new UserInputError('You have requested to many times. Please try again later.')
        }

      } else {
        return false
      }
    }
  } else {
    return false
  }
}