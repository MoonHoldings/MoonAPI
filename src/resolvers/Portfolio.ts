import { Coin, Nft, UserWallet } from '../entities'
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql'
import * as portfolioService from '../services/Porfolio'
import * as walletService from '../services/Wallet'
import * as nftService from '../services/Nft'
import { isAuth } from '../utils'
import { CoinData, CoinResponse, ExchangeInfo, UserWalletType } from '../types'

@Resolver()
export class PortfolioResolver {
  @Query(() => [Coin])
  getUserPortfolioCoins(@Arg('wallets', () => [String]) wallets: string[]): Promise<Coin[]> {
    return portfolioService.getUserPortfolioCoins(wallets)
  }

  @Query(() => CoinResponse)
  getUserPortfolioCoinsBySymbol(@Arg('symbol', () => String) symbol: string, @Arg('wallets', () => [String]) wallets: string[]): Promise<CoinResponse> {
    return portfolioService.getUserPortfolioCoinsBySymbol(wallets, symbol)
  }

  @Query(() => [UserWallet])
  getUserWallets(@Arg('type') type: UserWalletType, @Ctx() context: any): Promise<UserWallet[]> {
    const { payload } = context
    return walletService.getUserWallets(type, payload?.userId)
  }

  @Mutation(() => Boolean)
  removeExchangeWallet(@Arg('walletAddress', () => String) walletAddress: string, @Arg('exchangeAddress', () => String) exchangeAddress: string): Promise<Boolean> {
    return walletService.removeExchangeWallet(walletAddress, exchangeAddress)
  }

  @Query(() => [UserWallet])
  getExchangeWallets(@Arg('walletAddress', () => String) walletAddress: string): Promise<UserWallet[]> {
    return walletService.getExchangeWallets(walletAddress)
  }

  @Query(() => [Nft])
  getUserNfts(@Arg('wallets', () => [String]) wallets: string[]): Promise<Nft[]> {
    return nftService.getUserNfts(wallets)
  }

  @Mutation(() => Coin)
  async addUserCoin(@Arg('coinData', () => CoinData) coinData: CoinData, @Arg('walletAddress', () => String, { nullable: true }) walletAddress: string): Promise<Coin> {
    return await portfolioService.addUserCoin(coinData, walletAddress)
  }

  @Mutation(() => Boolean)
  async addExchangeCoins(@Arg('exchangeInfo', { nullable: true }) exchangeInfo: ExchangeInfo, @Arg('walletAddress', () => String, { nullable: true }) walletAddress: string): Promise<boolean> {
    return await portfolioService.addExchangeCoins(exchangeInfo, walletAddress)
  }

  @Mutation(() => Boolean)
  async deleteUserCoin(@Arg('coinData', () => CoinData) coinData: CoinData, @Arg('walletAddress', () => String) walletAddress: string): Promise<boolean> {
    return await portfolioService.deleteUserCoin(coinData, walletAddress)
  }
  @Mutation(() => Boolean)
  async deleteUserCoinBySymbol(@Arg('symbol', () => String) symbol: string, @Arg('walletAddress', () => String) walletAddress: string): Promise<boolean> {
    return await portfolioService.deleteUserCoinBySymbol(symbol, walletAddress)
  }

  @Mutation(() => Coin)
  async editUserCoin(@Arg('coinData', () => CoinData) coinData: CoinData, @Arg('walletAddress', () => String) walletAddress: string): Promise<Coin> {
    return await portfolioService.editUserCoin(coinData, walletAddress)
  }

  @Mutation(() => Boolean)
  async addUserWallet(@Arg('wallet') wallet: string, @Arg('verified') verified: boolean): Promise<Boolean> {
    return await walletService.addUserWallet(wallet, verified)
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async removeUserWallet(@Arg('wallet') wallet: string, @Ctx() context: any): Promise<Boolean> {
    const { payload } = context
    return await walletService.removeUserWallet(wallet, payload?.userId)
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async removeAllUserWallets(@Ctx() context: any, @Arg('isExchange', { defaultValue: false }) isExchange: boolean): Promise<Boolean> {
    const { payload } = context

    return await walletService.removeAllUserWallets(payload?.userId, isExchange)
  }

  @Mutation(() => Boolean)
  async refreshUserWallets(@Arg('wallets', () => [String]) wallets: string[]): Promise<Boolean> {
    return await walletService.refreshUserWallets(wallets)
  }

  @Query(() => Number)
  getUserPortfolioTotalByType(@Arg('wallets', () => [String]) wallets: string[], @Arg('type') type: string): Promise<number> {
    return portfolioService.getPortfolioTotalByType(wallets, type)
  }
}
