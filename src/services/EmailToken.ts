
import { Service } from 'typedi';
import { generateRandomString } from '../utils/string';
import { EmailToken, User } from '../entities';
import { EMAIL_EXPIRY_IN_DAYS } from '../constants';
import * as utils from '../utils'
import { add } from 'date-fns';


@Service()
export class EmailTokenService {

   async generateUserConfirmationToken(email: string): Promise<string> {
      const token = generateRandomString(32);

      const emailToken = await EmailToken.findOne({ where: { email } })
      const now = new Date();
      if (emailToken) {
         if (emailToken.isExpired()) {
            await EmailToken.save(
               Object.assign(emailToken, {
                  token: token,
                  generatedAt: now,
                  expireAt: add(now, { days: EMAIL_EXPIRY_IN_DAYS })
               })
            )
         } else {
            return emailToken.token;
         }
      } else {
         await EmailToken.save({
            email: email,
            token: token,
            generatedAt: now,
            expireAt: add(now, { days: EMAIL_EXPIRY_IN_DAYS })
         })
      }

      return token;
   }

   async validateUserToken(hashedToken: string): Promise<boolean> {
      const token = utils.decryptToken(utils.removedKey(hashedToken));
      const emailToken = await EmailToken.findOne({ where: { token } })

      if (!emailToken) {
         return false;
      }

      if (emailToken.isExpired()) {
         return false;
      }

      const user = await User.findOne({ where: { email: emailToken.email } })

      if (!user) {
         return false;
      }

      if (user.isVerified) {
         return false;
      } else {
         await User.save(Object.assign(user, {
            isVerified: true,
            verifiedAt: new Date(),
         }));
      }

      return true;
   }
}
