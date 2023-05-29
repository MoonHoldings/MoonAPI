import { GraphQLError } from 'graphql'
import { ApolloServerErrorCode } from '@apollo/server/errors'
import { Coin, User, UserWallet } from '../entities'
import { CoinData, CoinResponse, UserWalletType } from '../types'
import { shyft } from '../utils/shyft'
import { getCoinPrice, getCoinPrices, MOON_COINS, PYTH_COINS } from '../utils/pythCoins'
import { In } from 'typeorm'
import { AXIOS_CONFIG_HELLO_MOON_KEY, HELLO_MOON_URL } from '../constants'
import axios from 'axios'

export const getCoinsByUser = async (user: User): Promise<Coin[]> => {
  const userWallets = await UserWallet.find({ where: { user: { id: user.id }, hidden: false } })
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
    throw new GraphQLError('Coin not found', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }

  const userWallet = await UserWallet.find({ where: { user: { id: user.id }, name: coin.walletName, type: UserWalletType.Manual } })
  if (!userWallet) {
    throw new GraphQLError('Wallet not owned by user', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
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
    throw new GraphQLError('Coin not found', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }
  const userWallet = await UserWallet.find({ where: { user: { id: user.id }, id: coin.walletId, type: UserWalletType.Manual } })

  if (!userWallet) {
    throw new GraphQLError('User wallet not owned', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }

  try {
    await coin.remove()
    return true
  } catch (error) {
    throw new GraphQLError('', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }
}

export const deleteCoinDataBySymbol = async (symbol: string, user: User): Promise<boolean> => {
  const userWallets = await UserWallet.find({ where: { user: { id: user.id }, hidden: false, type: UserWalletType.Manual } })
  const coins = await Coin.find({
    where: [{ walletId: In(userWallets.map((wallet) => wallet.id)), symbol: symbol }],
  })
  if (!coins) {
    throw new GraphQLError('Coins not found', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }

  try {
    for (const coin of coins) {
      await coin.remove()
    }
    return true
  } catch (error) {
    throw new GraphQLError('', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }
}

export const connectCoins = async (walletAddress: string): Promise<boolean> => {
  try {
    const balances = await shyft.wallet.getAllTokenBalance({ wallet: walletAddress })
    const solBalance = await shyft.wallet.getBalance({ wallet: walletAddress })

    if (solBalance > 0) {
      processCoin(walletAddress, 'SOL', 'Solana', solBalance)
    }
    for (const balance of balances) {
      let matchingCoin = PYTH_COINS.find((coin) => coin.symbol.toLowerCase() === balance.info.symbol.toLowerCase() && coin.name === balance.info.name)

      if (!matchingCoin) {
        matchingCoin = MOON_COINS.find((coin) => coin.symbol.toLowerCase() === balance.info.symbol.toLowerCase() && coin.key === balance.address)
      }

      if (matchingCoin && matchingCoin.symbol.toLowerCase() !== 'sol') {
        processCoin(walletAddress, matchingCoin.symbol, matchingCoin.name, balance.balance)
      }
    }
    return true
  } catch (error) {
    throw new GraphQLError('', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }
}

export const processCoin = async (walletAddress: string, symbol: string, name: string, balance: number) => {
  const existingCoin = await Coin.findOne({ where: { walletAddress: walletAddress, symbol: symbol } })
  if (existingCoin && balance > 0.009) {
    existingCoin.symbol = symbol
    existingCoin.name = name
    existingCoin.holdings = balance
    existingCoin.save()
  } else if (existingCoin && balance < 0.009) {
    await existingCoin.remove()
  } else if (balance > 0.009) {
    const newCoin = new Coin()
    newCoin.symbol = symbol
    newCoin.name = name
    newCoin.holdings = balance
    newCoin.walletAddress = walletAddress
    await newCoin.save()
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

  const mintsMapping: Record<string, any> = {}
  tokenPrices.data.forEach((item: any) => {
    mintsMapping[item.mints] = item
  })

  const result: any[] = []
  mintAddress.forEach((mint: string) => {
    const dataObject = mintsMapping[mint]
    result.push(dataObject)
  })

  return result
}
