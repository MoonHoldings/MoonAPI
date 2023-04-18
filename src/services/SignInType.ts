import { SignInType, User } from '../entities'

export const hasSignInType = async (email: string, signInType: string) => {
  const user = await User.findOne({ where: { email } })

  if (user) {
    const signInTypeObject = await SignInType.findOne({ where: { user: { id: user.id }, signInType: signInType } })

    if (!signInTypeObject) {
      return false
    }

    return true
  } else {
    return true
  }
}

export const createSignInType = async (email: string, signInType: string) => {
  const user = await User.findOne({ where: { email } })

  if (user) return await SignInType.save({ user, signInType })
  else return false
}
