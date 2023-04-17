import { generateRandomString } from '../utils/string'
import { EmailToken, User } from '../entities'
import { EMAIL_EXPIRY_IN_DAYS } from '../constants'
import * as utils from '../utils'
import { add } from 'date-fns'
import { EmailTokenType } from '../enums'


export const generateUserConfirmationToken = async (email: string, type: string) => {
  const token = generateRandomString(32)

  const emailToken = await EmailToken.findOne({ where: { email } })
  const now = new Date()
  if (emailToken) {
    if (emailToken.isExpired()) {
      await EmailToken.save(
        Object.assign(emailToken, {
          token: token,
          generatedAt: now,
          expireAt: add(now, { days: EMAIL_EXPIRY_IN_DAYS }),
          emailTokenType: type
        })
      )
    } else {
      return emailToken.token
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

export const validateUserToken = async (hashedToked: string) => {
  const token = utils.decryptToken(utils.removedKey(hashedToked))
  const emailToken = await EmailToken.findOne({ where: { token } })

  if (!emailToken) {
    return null
  }
  if (emailToken.isExpired()) {
    return null
  }

  const user = await User.findOne({ where: { email: emailToken.email } })
  if (!user) {
    return null
  }

  if (emailToken.emailTokenType == EmailTokenType.CONFIRMATION_EMAIL) {
    if (user.isVerified) {
      return null
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
      return null
    }
    return user;
  }
}
