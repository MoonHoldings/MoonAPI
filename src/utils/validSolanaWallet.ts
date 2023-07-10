const { PublicKey } = require('@solana/web3.js')

const validSolanaWallet = (address: string) => {
  try {
    let pubkey = new PublicKey(address)
    let isSolana = PublicKey.isOnCurve(pubkey.toBuffer())

    return isSolana
  } catch (error) {
    return false
  }
}

export default validSolanaWallet
