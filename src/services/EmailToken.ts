import { EmailToken, User } from '../entities'
import { EMAIL_EXPIRY_IN_DAYS } from '../constants'
import * as utils from '../utils'
import { add, addMinutes, isAfter } from 'date-fns'
import { EmailTokenType } from '../enums'
import { GraphQLError } from 'graphql'
import { ApolloServerErrorCode } from '@apollo/server/errors'

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
    } else {
      const originalDate = new Date()
      const lockoutThresholdTime = addMinutes(emailToken.generatedAt, EMAIL_TOKEN_LOCKOUT_SECONDS)
      const attempts = emailToken.attempts

      if (isAfter(lockoutThresholdTime, originalDate)) {
        if (attempts <= MAX_EMAIL_TOKEN_ATTEMPTS) {
          await EmailToken.save(
            Object.assign(emailToken, {
              token: token,
              generatedAt: now,
              expireAt: add(now, { days: EMAIL_EXPIRY_IN_DAYS }),
              attempts: attempts + 1,
            })
          )
        } else {
          throw new GraphQLError('You have requested to many times. Please try again later.', {
            extensions: {
              code: ApolloServerErrorCode.BAD_USER_INPUT,
            },
          })
        }
      } else {
        await EmailToken.save(
          Object.assign(emailToken, {
            token: token,
            generatedAt: now,
            expireAt: add(now, { days: EMAIL_EXPIRY_IN_DAYS }),
            attempts: 1,
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
      emailTokenType: type,
    })
  }

  return token
}

export const validateUserToken = async (hashedToked: string, type: string) => {
  if (!hashedToked) {
    throw new GraphQLError('Invalid token', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }
  const token = utils.decryptToken(utils.removedKey(hashedToked))
  const emailToken = await EmailToken.findOne({ where: { token, emailTokenType: type } })

  if (!emailToken) {
    throw new GraphQLError('Invalid token', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }

  if (emailToken.isExpired()) {
    throw new GraphQLError('Expired token', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }

  const user = await User.findOne({ where: { email: emailToken.email } })

  if (!user) {
    throw new GraphQLError('User not found', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }

  if (emailToken.emailTokenType == EmailTokenType.CONFIRMATION_EMAIL) {
    if (user.isVerified) {
      throw new GraphQLError('User is already verified', {
        extensions: {
          code: ApolloServerErrorCode.BAD_USER_INPUT,
        },
      })
    } else {
      return await User.save(
        Object.assign(user, {
          isVerified: true,
          verifiedAt: new Date(),
        })
      )
    }
  } else {
    if (!user.isVerified) {
      throw new GraphQLError('Please verify to reset password', {
        extensions: {
          code: ApolloServerErrorCode.BAD_USER_INPUT,
        },
      })
    }
    await EmailToken.save(
      Object.assign(emailToken, {
        expireAt: new Date(),
      })
    )
    return user
  }
}

export const isLocked = async (email: string, type: string) => {
  const emailToken = await EmailToken.findOne({ where: { email, emailTokenType: type } })

  if (emailToken) {
    if (emailToken.isExpired()) {
      return false
    } else {
      const originalDate = new Date()
      const lockoutThresholdTime = addMinutes(emailToken.generatedAt, EMAIL_TOKEN_LOCKOUT_SECONDS)
      const attempts = emailToken.attempts

      if (isAfter(lockoutThresholdTime, originalDate)) {
        if (attempts <= MAX_EMAIL_TOKEN_ATTEMPTS) {
          return false
        } else {
          throw new GraphQLError('You have requested to many times. Please try again later.', {
            extensions: {
              code: ApolloServerErrorCode.BAD_USER_INPUT,
            },
          })
        }
      } else {
        return false
      }
    }
  } else {
    return false
  }
}
