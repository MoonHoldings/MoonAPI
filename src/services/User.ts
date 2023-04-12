import { UserInputError } from 'apollo-server-express';
import { User } from '../entities';
import Container, { Service } from 'typedi';
import { PasswordUtil } from '../utils/passwordUtil';
import { passwordStrength } from 'check-password-strength'

@Service()
export class UserService {
   private passwordUtil = Container.get(PasswordUtil);

   async register(email: string, password: string): Promise<User> {
      let user = await this.getUserByEmail(email);

      if (user) {
         throw new UserInputError('User exists');
      }

      let hashedPassword: string;
      if (passwordStrength(password).id != 0 || passwordStrength(password).id != 1)
         hashedPassword = await this.passwordUtil.generatePassword(password);
      else {
         throw new UserInputError('Password is too weak');
      }

      user = new User();
      user.email = email;
      user.password = hashedPassword;

      return await User.save(user);
   }


   async login(email: string, password: string): Promise<User> {
      let user = await this.getUserByEmail(email);

      if (!user) {
         throw new UserInputError('User does not exists');
      }

      let passwordMatched: boolean;
      passwordMatched = await this.passwordUtil.comparePassword(password, user.password);

      if (!passwordMatched) {
         throw new UserInputError('Email or Password is incorrect.');
      }

      user.lastLoginTimestamp = new Date();
      User.save(user);
      return user;
   }


   async getUserByEmail(email: string): Promise<User | null> {
      return await User.findOne({ where: { email } });;
   }
}
