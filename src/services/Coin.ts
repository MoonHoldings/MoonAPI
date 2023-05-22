import { UserInputError } from 'apollo-server-express'
import { Coin, User, UserWallet } from '../entities'
import { CoinData, CoinResponse, UserWalletType } from '../types'
import { shyft } from '../utils/shyft'
import { getCoinPrice, getCoinPrices, MOON_COINS, PYTH_COINS } from '../utils/pythCoins'
import { In } from 'typeorm'
import { AXIOS_CONFIG_HELLO_MOON_KEY, HELLO_MOON_URL } from '../constants'
import axios from 'axios'

export const getCoinsByUser = async (user: User): Promise<Coin[]> => {
  const userWallets = await UserWallet.find({ where: { user: { id: user.id } } })
  const manualWallets = userWallets.filter((wallet) => wallet.type === UserWalletType.Manual)
  const autoWallets = userWallets.filter((wallet) => wallet.type === UserWalletType.Auto)
  const coins = await Coin.find({
    where: [{ walletId: In(manualWallets.map((wallet) => wallet.id)) }, { walletAddress: In(autoWallets.map((wallet) => wallet.address)) }],
  })

  coins.forEach((coin) => {
    if (autoWallets.some((wallet) => wallet.address === coin.walletAddress)) {
      coin.isConnected = true
    }
  })

  const mergedCoins: { [symbol: string]: Coin } = {}

  try {
    coins.forEach((coin) => {
      const symbol = coin.symbol
      if (!mergedCoins[symbol]) {
        mergedCoins[symbol] = coin
        mergedCoins[symbol].holdings = parseFloat(parseFloat(coin.holdings.toString()).toFixed(2))
      } else {
        mergedCoins[symbol].holdings = parseFloat(mergedCoins[symbol].holdings.toString()) + parseFloat(coin.holdings.toString())
      }
    })
  } catch (error) {
    console.log(error.message)
  }

  return await getCoinPrices(Object.values(mergedCoins))
}

export const getCoinsBySymbol = async (user: User, symbol: string): Promise<CoinResponse> => {
  const userWallets = await UserWallet.find({ where: { user: { id: user.id }, hidden: false } })

  const coins = await Coin.find({
    where: [
      { walletId: In(userWallets.map((wallet) => wallet.id)), symbol },
      { walletAddress: In(userWallets.map((wallet) => wallet.address)), symbol },
    ],
  })

  const autoWallets = userWallets.filter((wallet) => wallet.type === UserWalletType.Auto)
  coins.forEach((coin) => {
    const walletMatched = autoWallets.find((wallet) => wallet.address === coin.walletAddress)
    if (walletMatched) {
      coin.verified = walletMatched.verified
      coin.isConnected = true
    }
    coin.holdings = parseFloat(parseFloat(coin.holdings.toString()).toFixed(2))
  })

  const finalCoins = await getCoinPrice(Object.values(coins), symbol)

  return finalCoins
}

export const updateCoinData = async (editCoin: CoinData, user: User): Promise<Coin> => {
  const coin = await Coin.findOne({
    where: { id: editCoin.id },
  })

  if (!coin) {
    throw new UserInputError('Coin not found')
  }

  const userWallet = await UserWallet.find({ where: { user: { id: user.id }, name: coin.walletName, type: UserWalletType.Manual } })
  if (!userWallet) {
    throw new UserInputError('Wallet Not owned by user.')
  }

  coin.walletName = editCoin.walletName
  coin.holdings = editCoin.holdings
  return await coin.save()
}

export const saveCoinData = async (coinData: CoinData, userWallet: UserWallet): Promise<Coin> => {
  const newCoin = new Coin()
  newCoin.symbol = coinData.symbol
  newCoin.name = coinData.name
  newCoin.holdings = coinData.holdings
  newCoin.walletId = userWallet.id
  newCoin.walletName = userWallet.name ?? null
  newCoin.walletAddress = userWallet.address ?? null
  newCoin.verified = userWallet.verified
  return await newCoin.save()
}

export const deleteCoinData = async (coinData: CoinData, user: User): Promise<boolean> => {
  const coin = await Coin.findOne({
    where: { id: coinData.id },
  })

  if (!coin) {
    throw new UserInputError('Coin not found')
  }
  const userWallet = await UserWallet.find({ where: { user: { id: user.id }, id: coin.walletId, type: UserWalletType.Manual } })

  if (!userWallet) {
    throw new UserInputError('User wallet not owned')
  }
  try {
    await coin.remove()
    return true
  } catch (error) {
    throw new UserInputError(error)
  }
}

export const deleteCoinDataBySymbol = async (symbol: string, user: User): Promise<boolean> => {
  const userWallets = await UserWallet.find({ where: { user: { id: user.id }, hidden: false, type: UserWalletType.Manual } })
  const coins = await Coin.find({
    where: [{ walletId: In(userWallets.map((wallet) => wallet.id)), symbol: symbol }],
  })
  if (!coins) {
    throw new UserInputError('Coins not found')
  }

  try {
    for (const coin of coins) {
      await coin.remove()
    }
    return true
  } catch (error) {
    throw new UserInputError(error)
  }
}

export const connectCoins = async (walletAddress: string): Promise<boolean> => {
  try {
    const balances = await shyft.wallet.getAllTokenBalance({ wallet: walletAddress })
    for (const balance of balances) {
      let matchingCoin = PYTH_COINS.find((coin) => coin.name.toLowerCase() === balance.info.name.toLowerCase())

      if (!matchingCoin) {
        matchingCoin = MOON_COINS.find((coin) => coin.symbol.toLowerCase() === balance.info.symbol.toLowerCase())
      }
      if (matchingCoin && balance.balance > 0.009) {
        const existingCoin = await Coin.findOne({ where: { walletAddress: walletAddress, symbol: matchingCoin.symbol } })
        if (existingCoin) {
          existingCoin.symbol = matchingCoin.symbol
          existingCoin.name = balance.info.name
          existingCoin.holdings = balance.balance
          existingCoin.save()
        } else {
          const newCoin = new Coin()
          newCoin.symbol = matchingCoin.symbol
          newCoin.name = balance.info.name
          newCoin.holdings = balance.balance
          newCoin.walletAddress = walletAddress
          await newCoin.save()
        }
      }
    }
    return true
  } catch (error) {
    throw new UserInputError(error)
  }
}

export const getMoonTokenPrice = async (mintAddress: [string]) => {
  const { data: tokenPrices }: { data: any } = await axios.post(
    `${HELLO_MOON_URL}/token/price/batched`,
    {
      mints: mintAddress,
    },
    AXIOS_CONFIG_HELLO_MOON_KEY
  )

  return tokenPrices.data.slice().reverse()
}
