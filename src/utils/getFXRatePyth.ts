import { Connection } from '@solana/web3.js'
import { PythHttpClient, getPythClusterApiUrl, getPythProgramKeyForCluster, PythCluster } from '@pythnetwork/client'

const PYTHNET_CLUSTER_NAME: PythCluster = 'pythnet'
const connection = new Connection(getPythClusterApiUrl(PYTHNET_CLUSTER_NAME))
const pythPublicKey = getPythProgramKeyForCluster(PYTHNET_CLUSTER_NAME)

const getFXRatePyth = async (base: string, quote: string): Promise<number | null> => {
  const pythClient = new PythHttpClient(connection, pythPublicKey)
  const data = await pythClient.getData()

  for (const symbol of data.symbols) {
    const price = data.productPrice.get(symbol)!
    const requestedPair = `Crypto.${base}/${quote}`

    if (price.price && price.confidence && symbol.includes(requestedPair)) {
      return price.price
    }
  }

  return null
}

export default getFXRatePyth
