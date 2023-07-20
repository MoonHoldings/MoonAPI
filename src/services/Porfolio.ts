import { GraphQLError } from 'graphql'
import { ApolloServerErrorCode } from '@apollo/server/errors'
import { CoinData, CoinResponse, ExchangeInfo, PortfolioType, UserWalletType } from '../types'
import { Coin, User, UserWallet } from '../entities'
import * as coinService from './Coin'
import * as userService from './User'
import * as userWalletService from './Wallet'
import { getBorrowTotal, getCryptoTotal, getLoanTotal, getNftTotal } from './Dashboard'
import { clearCoin } from './Coin'

const getUserByAddress = async (address: string): Promise<User> => {
  const userWallet = await UserWallet.findOne({ where: { address }, relations: ['user'] })

  if (!userWallet) {
    throw new GraphQLError('User Wallet not found', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }

  const user = await userService.getUserById(userWallet.user!.id)
  if (!user) {
    throw new GraphQLError('User not found', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }

  return user
}

export const getUserPortfolioCoins = async (wallets: string[]): Promise<Coin[]> => {
  return await coinService.getCoinsByWallet(wallets)
}

export const getUserPortfolioCoinsBySymbol = async (walletAddress: string, symbol: string): Promise<CoinResponse> => {
  const user = await getUserByAddress(walletAddress)

  return await coinService.getCoinsBySymbol(user, symbol)
}

export const addUserCoin = async (coinData: CoinData, walletAddress: string) => {
  const user = await getUserByAddress(walletAddress)
  const existingManualWallet = await userWalletService.checkExistingWallet(user, UserWalletType.Manual, coinData.walletName, undefined)

  if (!existingManualWallet) {
    throw new GraphQLError('User Wallet not found/created', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }

  try {
    return await coinService.saveCoinData(coinData, existingManualWallet)
  } catch (error) {
    throw new GraphQLError('', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }
}

export const addExchangeCoins = async (exchangeInfo: ExchangeInfo, userId: number) => {
  const userWallet = await UserWallet.findOne({ where: { address: 'walletAddress' } })
  console.log(userId)
  try {
    const deleteChecker = []

    for (const coinData of exchangeInfo.coinData) {
      deleteChecker.push(coinData.symbol)
      await coinService.updateCoinOnly(coinData, userWallet!)
    }
    await clearCoin(deleteChecker, exchangeInfo.walletAddress)
    return false
  } catch (error) {
    throw new GraphQLError('', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }
}

export const deleteUserCoin = async (coinData: CoinData, walletAddress: string) => {
  const user = await getUserByAddress(walletAddress)

  try {
    return coinService.deleteCoinData(coinData, user)
  } catch (error) {
    throw new GraphQLError('', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }
}

export const deleteUserCoinBySymbol = async (symbol: string, walletAddress: string) => {
  const user = await getUserByAddress(walletAddress)

  try {
    return coinService.deleteCoinDataBySymbol(symbol, user)
  } catch (error) {
    throw new GraphQLError('', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }
}

export const editUserCoin = async (coinData: CoinData, walletAddress: string) => {
  const user = await getUserByAddress(walletAddress)

  if (!coinData.walletName) {
    throw new GraphQLError('Connected coins cannot be deleted', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }

  await userWalletService.updateWallet(coinData.walletId, coinData.walletName, user.id)

  try {
    return coinService.updateCoinData(coinData, user)
  } catch (error) {
    throw new GraphQLError('', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }
}

export const connectWalletCoins = async (walletAddress: string, userId: number) => {
  const user = await userService.getUserById(userId)
  if (!user) {
    throw new GraphQLError('User not found', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }

  try {
    return coinService.connectCoins(walletAddress)
  } catch (error) {
    throw new GraphQLError('', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }
}

export const getPortfolioTotalByType = async (wallets: string[], type: string): Promise<number> => {
  let totalPortfolio = 0

  if (type === PortfolioType.NFT) {
    totalPortfolio = await getNftTotal(wallets)
  }
  if (type === PortfolioType.CRYPTO) {
    totalPortfolio = await getCryptoTotal(wallets)
  }
  if (type === PortfolioType.LOAN) {
    totalPortfolio = await getLoanTotal(wallets)
  }
  if (type === PortfolioType.BORROW) {
    totalPortfolio = await getBorrowTotal(wallets)
  }

  return totalPortfolio
}
