import { validate } from 'bitcoin-address-validation'

const validBitcoinWallet = (address: string) => {
  try {
    return validate(address)
  } catch (error) {
    return false
  }
}

export default validBitcoinWallet
