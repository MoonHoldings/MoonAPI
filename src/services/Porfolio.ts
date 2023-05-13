import { CoinData } from '../types'
import { Coin } from '../entities'
import * as coinService from './Coin'
import * as userService from './User'
import { UserInputError } from 'apollo-server-express'

export const getUserPortfolioCoins = async (userId: number): Promise<Coin[]> => {
  const user = await userService.getUserById(userId)
  if (!user) {
    throw new UserInputError('User not found')
  }
  return await coinService.getCoinsByUserId(user)
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

  try {
    return await coinService.saveCoinData(coinData, user)
  } catch (error) {
    throw new UserInputError(error)
  }
}

export const deleteUserCoin = async (id: number, userId: number) => {
  const user = await userService.getUserById(userId)
  if (!user) {
    throw new UserInputError('User not found')
  }

  try {
    return coinService.deleteCoinData(id, user)
  } catch (error) {
    console.log('3333')
    throw new UserInputError(error)
  }
}

export const editUserCoin = async (coinData: CoinData, userId: number) => {
  const user = await userService.getUserById(userId)
  if (!user) {
    throw new UserInputError('User not found')
  }

  try {
    return coinService.updateCoinData(coinData, user)
  } catch (error) {
    throw new UserInputError(error)
  }
}

export const connectWalletCoins = async (walletAddress: string, userId: number, isVerified: boolean) => {
  const user = await userService.getUserById(userId)
  if (!user) {
    throw new UserInputError('User not found')
  }

  try {
    return coinService.connectCoins(walletAddress, user, isVerified)
  } catch (error) {
    throw new UserInputError(error)
  }
}
