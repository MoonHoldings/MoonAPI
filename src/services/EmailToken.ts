
import { Service } from 'typedi';
import { generateRandomString } from '../utils/string';
import { EmailToken, User } from '../entities';
import { EMAIL_EXPIRY_IN_DAYS } from '../constants';


import * as utils from '../utils'
import moment from 'moment';


@Service()
export class EmailTokenService {

   async generateUserConfirmationToken(email: string): Promise<string> {
      const token = generateRandomString(32);
      const now = moment();
      const emailToken = await EmailToken.findOne({ where: { email } })

      if (emailToken) {
         if (emailToken.isExpired()) {
            await EmailToken.save(
               Object.assign(emailToken, {
                  token: token,
                  generatedAt: now.toDate(),
                  expireAt: now.add(EMAIL_EXPIRY_IN_DAYS, 'days').toDate()
               })
            )
         } else {
            return emailToken.token;
         }
      } else {
         await EmailToken.save({
            email: email,
            token: token,
            generatedAt: now.toDate(),
            expireAt: now.add(EMAIL_EXPIRY_IN_DAYS, 'days').toDate(),
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
            verifiedAt: moment().toDate(),
         }));
      }

      return true;
   }
}
