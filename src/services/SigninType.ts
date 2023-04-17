import { SigninType } from '../entities'


export const hasSigninType = async (email: string, signinType: string) => {
   const signupTypeObect = await SigninType.findOne({ where: { email, signinType } })
   if (!signupTypeObect) {
      return false
   }
   return true;
}

export const createSigninType = async (email: string, signinType: string) => {
   return await SigninType.save({ email, signinType })
}
