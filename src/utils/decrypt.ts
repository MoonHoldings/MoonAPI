import CryptoJS from 'crypto-js'
import { CRYPTO_SECRET } from '../constants'

const decrypt = (tobeDecrypted: any) => {
  const bytes = CryptoJS.AES.decrypt(tobeDecrypted, CRYPTO_SECRET as string)
  const originalText = bytes.toString(CryptoJS.enc.Utf8)

  return JSON.parse(originalText)
}

export default decrypt
