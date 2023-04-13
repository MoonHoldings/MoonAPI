import { ExpressContext, UserInputError } from 'apollo-server-express';
import { User } from '../entities';
import { Service } from 'typedi';

import { passwordStrength } from 'check-password-strength'
import { SignupType } from '../enums';

import * as utils from '../utils';

@Service()
export class UserService {

   async register(email: string, password: string): Promise<User> {
      let user = await this.getUserByEmail(email);

      if (user) {
         throw new UserInputError('User exists');
      }

      let hashedPassword: string;
      if (passwordStrength(password).id != 0 || passwordStrength(password).id != 1)
         hashedPassword = await utils.generatePassword(password);
      else {
         throw new UserInputError('Password is too weak');
      }

      user = new User();
      user.email = email;
      user.password = hashedPassword;
      user.signupType = SignupType.EMAIL;

      return await User.save(user);
   }


   async login(email: string, password: string, ctx: ExpressContext): Promise<User> {
      let user = await this.getUserByEmail(email);

      if (!user) {
         throw new UserInputError('User does not exists');
      }

      let passwordMatched: boolean;
      passwordMatched = await utils.comparePassword(password, user.password);

      if (!passwordMatched) {
         throw new UserInputError('Email or Password is incorrect.');
      }

      user.lastLoginTimestamp = new Date();
      User.save(user);

      ctx.res.cookie('jid', utils.createRefreshToken(user), { httpOnly: true });
      user.accessToken = utils.createAccessToken(user);

      return user;
   }


   async getUserByEmail(email: string): Promise<User | null> {
      return await User.findOne({ where: { email } });;
   }

   async incrementRefreshVersion(id: number): Promise<void> {
      try {
         User.incrementTokenVersion(id)
      }
      catch (err) {
         console.log(err)
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
