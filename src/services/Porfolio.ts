import { GraphQLError } from 'graphql'
import { ApolloServerErrorCode } from '@apollo/server/errors'
import { CoinData, CoinResponse, ExchangeInfo, PortfolioType, UserWalletType } from '../types'
import { Coin } from '../entities'
import * as coinService from './Coin'
import * as userService from './User'
import * as userWalletService from './Wallet'
import { getBorrowTotal, getCryptoTotal, getLoanTotal, getNftTotal } from './Dashboard'
import { clearCoin } from './Coin'

export const getUserPortfolioCoins = async (userId: number): Promise<Coin[]> => {
  const user = await userService.getUserById(userId)
  if (!user) {
    throw new GraphQLError('User not found', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }
  return await coinService.getCoinsByUser(user)
}

export const getUserPortfolioCoinsBySymbol = async (userId: number, symbol: string): Promise<CoinResponse> => {
  const user = await userService.getUserById(userId)
  if (!user) {
    throw new GraphQLError('User not found', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }

  return await coinService.getCoinsBySymbol(user, symbol)
}

export const addUserCoin = async (coinData: CoinData, userId: number) => {
  const user = await userService.getUserById(userId)
  if (!user) {
    throw new GraphQLError('User not found', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }

  const userWallet = await userWalletService.checkExistingWallet(user.id, coinData.type ?? UserWalletType.Manual, coinData.walletName, coinData.walletAddress)

  try {
    return await coinService.saveCoinData(coinData, userWallet)
  } catch (error) {
    throw new GraphQLError('', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }
}

export const addExchangeCoins = async (exchangeInfo: ExchangeInfo, userId: number) => {
  const user = await userService.getUserById(userId)
  if (!user) {
    throw new GraphQLError('User not found', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }

  const userWallet = await userWalletService.checkExistingWallet(user.id, UserWalletType.Auto, exchangeInfo.walletName, exchangeInfo.walletAddress)

  try {
    const deleteChecker = []

    for (const coinData of exchangeInfo.coinData) {
      deleteChecker.push(coinData.symbol)
      await coinService.updateCoinOnly(coinData, userWallet)
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

export const deleteUserCoin = async (coinData: CoinData, userId: number) => {
  const user = await userService.getUserById(userId)
  if (!user) {
    throw new GraphQLError('User not found', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }

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

export const deleteUserCoinBySymbol = async (symbol: string, userId: number) => {
  const user = await userService.getUserById(userId)
  if (!user) {
    throw new GraphQLError('User not found', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }

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

export const editUserCoin = async (coinData: CoinData, userId: number) => {
  const user = await userService.getUserById(userId)
  if (!user) {
    throw new GraphQLError('User not found', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }

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

export const getPortfolioTotalByType = async (userId: number, type: string): Promise<number> => {
  const user = await userService.getUserById(userId)
  if (!user) {
    throw new GraphQLError('User not found', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    })
  }

  let totalPortfolio = 0

  if (type === PortfolioType.NFT) {
    totalPortfolio = await getNftTotal(user)
  }
  if (type === PortfolioType.CRYPTO) {
    console.log('HEY')
    totalPortfolio = await getCryptoTotal(user)
  }
  if (type === PortfolioType.LOAN) {
    totalPortfolio = await getLoanTotal(user)
  }
  if (type === PortfolioType.BORROW) {
    totalPortfolio = await getBorrowTotal(user)
  }

  return totalPortfolio
}
