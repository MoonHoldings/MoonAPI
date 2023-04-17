import { Service } from 'typedi'
import { SigninType } from '../entities'

@Service()
export class SigninTypeService {
   async hasSigninType(email: string, signinType: string): Promise<boolean> {
      const signupTypeObect = await SigninType.findOne({ where: { email, signinType } })
      if (!signupTypeObect) {
         return false
      }
      return true;
   }

   async createSigninType(email: string, signinType: string): Promise<SigninType> {
      return await SigninType.save({ email, signinType })
   }
}
