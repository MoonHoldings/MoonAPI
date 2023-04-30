import CryptoJS from 'crypto-js'
import { CRYPTO_SECRET } from '../constants'

const encrypt = (tobeEncrypted: any) => {
  const encryptedText = CryptoJS.AES.encrypt(JSON.stringify(tobeEncrypted), CRYPTO_SECRET as string)

  return encryptedText
}

export default encrypt
