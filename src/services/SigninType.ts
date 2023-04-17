import { SigninType, User } from '../entities'

export const hasSigninType = async (email: string, signInType: string) => {
  const user = await User.findOne({ where: { email } })

  if (user) {
    const signupTypeObect = await SigninType.findOne({ where: { user: { id: user.id }, signinType: signInType } })

    if (!signupTypeObect) {
      return false
    }

    return true
  } else {
    return true
  }
}

export const createSigninType = async (email: string, signinType: string) => {
  const user = await User.findOne({ where: { email } })

  if (user) return await SigninType.save({ user, signinType })
  else return false
}
