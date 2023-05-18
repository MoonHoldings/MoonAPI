import { CoinData, UserWalletType } from '../types'
import { Coin } from '../entities'
import * as coinService from './Coin'
import * as userService from './User'
import * as userWalletService from './Wallet'
import { UserInputError } from 'apollo-server-express'

export const getUserPortfolioCoins = async (userId: number): Promise<Coin[]> => {
  const user = await userService.getUserById(userId)
  if (!user) {
    throw new UserInputError('User not found')
  }
  return await coinService.getCoinsByUser(user)
}

export const getUserPortfolioCoinsBySymbol = async (userId: number, symbol: string): Promise<Coin[]> => {
  const user = await userService.getUserById(userId)
  if (!user) {
    throw new UserInputError('User not found')
  }

  return await coinService.getCoinsBySymbol(user, symbol)
}

export const addUserCoin = async (coinData: CoinData, userId: number) => {
  const user = await userService.getUserById(userId)
  if (!user) {
    throw new UserInputError('User not found')
  }

  const userWallet = await userWalletService.checkExistingWallet(user.id, UserWalletType.Manual, coinData.walletName)

  try {
    return await coinService.saveCoinData(coinData, userWallet)
  } catch (error) {
    throw new UserInputError(error)
  }
}

export const deleteUserCoin = async (coinData: CoinData, userId: number) => {
  const user = await userService.getUserById(userId)
  if (!user) {
    throw new UserInputError('User not found')
  }

  try {
    return coinService.deleteCoinData(coinData, user)
  } catch (error) {
    throw new UserInputError(error)
  }
}

export const deleteUserCoinBySymbol = async (symbol: string, userId: number) => {
  const user = await userService.getUserById(userId)
  if (!user) {
    throw new UserInputError('User not found')
  }

  try {
    return coinService.deleteCoinDataBySymbol(symbol, user)
  } catch (error) {
    throw new UserInputError(error)
  }
}

export const editUserCoin = async (coinData: CoinData, userId: number) => {
  const user = await userService.getUserById(userId)
  if (!user) {
    throw new UserInputError('User not found')
  }

  if (!coinData.walletName) {
    throw new UserInputError('Connected coins cannot be deleted')
  }

  await userWalletService.updateWallet(coinData.walletId, coinData.walletName, user.id)

  try {
    return coinService.updateCoinData(coinData, user)
  } catch (error) {
    throw new UserInputError(error)
  }
}

export const connectWalletCoins = async (
  // walletAddress: string,
  userId: number
) => {
  const user = await userService.getUserById(userId)
  if (!user) {
    throw new UserInputError('User not found')
  }

  try {
    // return coinService.connectCoins(walletAddress)
  } catch (error) {
    throw new UserInputError(error)
  }
}
