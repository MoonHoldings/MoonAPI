import { PythHttpClient, getPythClusterApiUrl, getPythProgramKeyForCluster } from '@pythnetwork/client'
import { Connection, PublicKey } from '@solana/web3.js'
import { Coin } from '../entities'
import { getMoonTokenPrice } from '../services/Coin'
import { CoinResponse } from '../types'

const PYTHNET_CLUSTER_NAME = 'pythnet'
const connection = new Connection(getPythClusterApiUrl(PYTHNET_CLUSTER_NAME))
const pythPublicKey = getPythProgramKeyForCluster(PYTHNET_CLUSTER_NAME)

const pythClient = new PythHttpClient(connection, pythPublicKey)

function getMatchingCoins(coinKeys: any[], coins: any[]) {
  const coinsLookup: { [key: string]: any } = {}
  coins.forEach((coin) => {
    const symbol = coin.symbol.toLowerCase()
    coinsLookup[symbol] = coin.key
  })

  return coinKeys
    .map((myCoin) => {
      const symbol = myCoin.symbol.toLowerCase()
      const key = coinsLookup[symbol]

      if (key) {
        return {
          ...myCoin,
          key: key,
        }
      }
    })
    .filter((coin) => coin !== undefined)
}

export async function getCoinPrices(userCoins: Coin[]) {
  try {
    const pythList = getMatchingCoins(userCoins, PYTH_COINS)
    let coinsArray: any[] = []

    if (pythList.length > 0) {
      const pythCoins = pythList.map((obj) => new PublicKey(obj.key))
      const data = await pythClient.getAssetPricesFromAccounts(pythCoins)

      let pythWithPrice = pythList.map((myCoin, index) => {
        const formattedPrice = Math.abs(data[index].price!) > 0.009 ? data[index].price!.toFixed(2) : data[index].price!.toFixed(10)
        return { ...myCoin, price: formattedPrice }
      })
      coinsArray = pythWithPrice
    }

    const moonList = getMatchingCoins(userCoins, MOON_COINS)
    if (moonList.length > 0) {
      const moonCoins = moonList.map((obj) => obj.key) as [string]
      const moonData = await getMoonTokenPrice(moonCoins)

      let moonWithPrice = moonList.map((myCoin, index) => {
        return { ...myCoin, price: moonData[index].price / 1000000 }
      })

      if (coinsArray.length > 0) {
        coinsArray = [...coinsArray, ...moonWithPrice]
      } else {
        coinsArray = moonWithPrice
      }
    }

    return coinsArray
  } catch (error) {
    return userCoins.map((myCoin) => {
      return { ...myCoin, price: 0 }
    })
  }
}

export async function getCoinPrice(userCoins: any[], symbol: string) {
  let price = '0'
  let resp = new CoinResponse()
  try {
    const coinWithKey = PYTH_COINS.find((coin) => coin.symbol === symbol)
    if (coinWithKey) {
      const pythCoins = new PublicKey(coinWithKey.key)
      const data = await pythClient.getAssetPricesFromAccounts([pythCoins])
      const formattedPrice = Math.abs(data[0].price!) > 0.009 ? data[0].price!.toFixed(2) : data[0].price!.toFixed(10)
      price = formattedPrice
    }

    const moonWithKey = MOON_COINS.find((coin) => coin.symbol === symbol)
    if (moonWithKey) {
      const moonCoins = [moonWithKey.key] as [string]
      const moonData = await getMoonTokenPrice(moonCoins)

      price = (moonData[0].price / 1000000).toString()
    }

    resp.coins = userCoins
    resp.price = price
  } catch (error) {
    console.log(error.message)
    resp.coins = userCoins
    resp.price = price
  }
  return resp
}

export const PYTH_COINS = [
  {
    symbol: 'ALGO',
    name: 'Algorand',
    key: 'HqFyq1wh1xKvL7KDqqT7NJeSPdAqsDqnmBisUC2XdXAX',
  },
  {
    symbol: 'ADA',
    name: 'Cardano',
    key: '3pyn4svBbxJ9Wnn3RVeafyLWfzie6yC5eTig2S62v9SC',
  },
  {
    symbol: 'APT',
    name: 'Apidae',
    key: 'FNNvb1AFDnDVPkocEri8mWbJ1952HQZtFLuwPiUjSJQ',
  },
  {
    symbol: 'AAVE',
    name: 'Aave',
    key: '3wDLxH34Yz8tGjwHszQ2MfzHwRoaQgKA32uq2bRpjJBW',
  },
  {
    symbol: 'APE',
    name: 'ApeCoin',
    key: '2TdKEvPTKpDtJo6pwxd79atZFQNWiSUT2T47nF9j5qFy',
  },
  {
    symbol: 'ATLAS',
    name: 'Atlantis',
    key: '81Rz3i7MC9nHYo1vQg6kJM5hepjqb63Y1gnr3AkrD36D',
  },
  {
    symbol: 'AVAX',
    name: 'Avalanche',
    key: 'Ax9ujW5B9oqcv59N8m6f1BpTBq2rGeGaBcpKjC5UYsXU',
  },

  {
    symbol: 'ARB',
    name: 'Arbitrum',
    key: '5HRrdmghsnU3i2u5StaKaydS7eq3vnKVKwXMzCNKsc4C',
  },
  {
    symbol: 'ATOM',
    name: 'Cosmos Hub',
    key: 'CrCpTerNqtZvqLcKqz1k13oVeXV9WkMD2zA9hBKXrsbN',
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    key: 'GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU',
    color: '#F7931A',
  },
  {
    symbol: 'BNB',
    name: 'BNB',
    key: '4CkQJBxhU8EZ2UjhigbtdaPbpTe6mqf811fipYBFbSYN',
  },
  {
    symbol: 'BCH',
    name: 'Bitcoin Cash',
    key: '5ALDzwcRJfSyGdGyhP3kP628aqBNHZzLuVww7o9kdspe',
  },
  {
    symbol: 'BAT',
    name: 'Basic Attention',
    key: 'AbMTYZ82Xfv9PtTQ5e1fJXemXjzqEEFHP3oDLRTae6yz',
  },
  {
    symbol: 'BLUR',
    name: 'Blur',
    key: '9yoZqrXpNpP8vfE7XhN3jPxzALpFA8C5Nvs1RNXQigCQ',
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    key: '8ihFLu5FimgTQ1Unh4dVyEHUGodJ5gJQCrQf4KUVB9bN',
  },

  {
    symbol: 'BUSD',
    name: 'Binance USD',
    key: '7BHyT7XPMSA6LHYTgDTaeTPe3KTkKibMXZNxF5kiVsw1',
  },

  {
    symbol: 'C98',
    name: 'Coin98',
    key: '45rTB9ezDcTX5tMZx2uJUBbBEqAWDhXykYbBfaSWUXvD',
  },

  {
    symbol: 'DOT',
    name: 'Polkadot',
    key: 'EcV1X1gY2yb4KXxjVQtTHTbioum2gvmPnFk4zYAt7zne',
  },
  {
    symbol: 'DAI',
    name: 'Dai',
    key: 'CtJ8EkqLmeYyGB8s4jevpeNsvmD4dxVR2krfsDLcvV8Y',
  },
  {
    symbol: 'DOGE',
    name: 'Dogecoin',
    key: 'FsSM3s38PX9K7Dn6eGzuE29S2Dsk1Sss1baytTQdCaQj',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    key: 'JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB',
    color: '#016F9E',
  },

  {
    symbol: 'FTT',
    name: 'FTX',
    key: '8JPJJkmDScpcNmBRKGZuPuG2GYAveQgP3t5gFuMymwvF',
  },

  {
    symbol: 'FIDA',
    name: 'Bonfida',
    key: 'ETp9eKXVv1dWwHSpsXRUuXHmw24PwRkttCGVgpZEY9zF',
  },
  {
    symbol: 'GMT',
    name: 'Gomining Token',
    key: 'DZYZkJcFJThN9nZy4nK3hrHra1LaWeiyoZ9SMdLFEFpY',
  },

  {
    symbol: 'HNT',
    name: 'Helium',
    key: '7moA1i5vQUpfDwSpK6Pw9s56ahB7WFGidtbL2ujWrVvm',
  },

  {
    symbol: 'INJ',
    name: 'Injective',
    key: '9EdtbaivHQYA4Nh3XzGR6DwRaoorqXYnmpfsnFhvwuVj',
  },

  {
    symbol: 'LUNC',
    name: 'Terra Classic (Wormhole)',
    key: '5bmWuR1dgP4avtGYMNKLuxumZTVKGgoN2BCMXWDNL9nY',
  },

  {
    symbol: 'LDO',
    name: 'Lido DAO',
    key: 'ELrhqYY3WjLRnLwWt3u7sMykNc87EScEAsyCyrDDSAXv',
  },

  {
    symbol: 'LTC',
    name: 'Litecoin',
    key: '8RMnV1eD55iqUFJLMguPkYBkq8DCtx81XcmAja93LvRR',
  },
  {
    symbol: 'MATIC',
    name: 'Polygon',
    key: '7KVswB9vkCgeM3SHP7aGDijvdRAHK8P5wi9JXViCrtYh',
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    key: 'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG',
    color: '#BC12EC',
  },

  {
    symbol: 'MSOL',
    name: 'Marinade staked SOL',
    key: 'E4v1BBgoso9s64TQvmyownAVJbhbEPGyzA3qn4n46qj9',
  },
  {
    symbol: 'MNGO',
    name: 'Mango',
    key: '79wm3jjcPr6RaNQ4DGvP5KxG1mNd3gEBsg6FsNVFezK4',
  },

  {
    symbol: 'NEAR',
    name: 'NEAR Protocol',
    key: 'ECSFWQ1bnnpqPVvoy9237t2wddZAaHisW88mYxuEHKWf',
  },
  {
    symbol: 'ORCA',
    name: 'Orca',
    key: '4ivThkX8uRxBpHsdWSqyXYihzKF3zpRGAUCqyuagnLoV',
  },
  {
    symbol: 'OP',
    name: 'Optimism',
    key: '4o4CUwzFwLqCvmA5x1G4VzoZkAhAcbiuiYyjWX1CVbY2',
  },

  {
    symbol: 'PORT',
    name: 'PackagePortal',
    key: 'jrMH4afMEodMqirQ7P89q5bGNJxD8uceELcsZaVBDeh',
  },

  {
    symbol: 'RAY',
    name: 'Raydium',
    key: 'AnLf8tVYCM816gmBjiy8n53eXKKEDydT5piYjjQDPgTB',
  },

  {
    symbol: 'SBR',
    name: 'Saber',
    key: '8Td9VML1nHxQK6M8VVyzsHo32D7VBk72jSpa9U861z2A',
  },
  {
    symbol: 'SCNSOL',
    name: 'Socean Staked Sol',
    key: '25yGzWV5okF7aLivSCE4xnjVUPowQcThhhx5Q2fgFhkm',
  },
  {
    symbol: 'SRM',
    name: 'Serum',
    key: '3NBReDRTLKMQEKiLD5tGcx4kXbTf88b7f2xLS9UuGjym',
  },
  {
    symbol: 'SUI',
    name: 'Sui',
    key: '3Qub3HaAJaa2xNY7SUqPKd3vVwTqDfDDkEUMPjXD2c1q',
  },

  {
    symbol: 'STSOL',
    name: 'Lido Staked SOL',
    key: 'Bt1hEbY62aMriY1SyQqbeZbm8VmSbQVGBFzSzMuVNWzN',
  },
  {
    symbol: 'SLND',
    name: 'Solend',
    key: 'HkGEau5xY1e8REXUFbwvWWvyJGywkgiAZZFpryyraWqJ',
  },
  {
    symbol: 'SNY',
    name: 'Synthetify',
    key: 'BkN8hYgRjhyH5WNBQfDV73ivvdqNKfonCMhiYVJ1D9n9',
  },
  {
    symbol: 'USDC',
    name: 'USDC',
    key: 'Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD',
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    key: '3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL',
  },
  {
    symbol: 'USTC',
    name: 'TerraClassicUSD',
    key: 'H8DvrfSaRfUyP1Ytse1exGf7VSinLWtmKNNaBhA4as9P',
  },
  {
    symbol: 'ZBC',
    name: 'Zebec Protocol',
    key: '3bNH7uDsap5nzwhCvv98i7VshjMagtx1NXTDBLbPYD66',
  },
]

export const MOON_COINS = [
  {
    symbol: 'FRONK',
    name: 'FRONK',
    key: '5yxNbU8DgYJZNi3mPD9rs4XLh9ckXrhPjJ5VCujUWg5H',
  },
  {
    symbol: 'KING',
    name: 'KING',
    key: '9noXzpXnkyEcKF3AeXqUHTdR59V5uvrRBUZ9bwfQwxeq',
  },
  {
    symbol: 'MNDE',
    name: 'MNDE',
    key: 'MNDEFzGvMt87ueuHvVU9VcTqsAP5b3fTGPsHuuPA5ey',
  },
  {
    symbol: 'AURY',
    name: 'AURY',
    key: 'AURYydfxJib1ZkTir1Jn1J9ECYUtjb6rKQVmtYaixWPP',
  },
  {
    symbol: 'HAWK',
    name: 'HAWK',
    key: 'BKipkearSqAUdNKa1WDstvcMjoPsSKBuNyvKDQDDu9WE',
  },
  {
    symbol: 'SAMO',
    name: 'Samoyed coin',
    key: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  },
  {
    symbol: 'POLIS',
    name: 'Star Atlas DAO',
    key: 'poLisWXnNRwC6oBu1vHiuKQzFjGL4XDSu4g9qjz9qVk',
  },
  {
    symbol: 'STEPN',
    name: 'STEPN',
    key: '6156vEwBw11hGF6rkr3um5RPNWfBCYBFH7XcbEF47erH',
  },

  {
    symbol: 'DUST',
    name: 'DUST Protocol',
    key: 'DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ',
  },
]
