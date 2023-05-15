import { Coin, Nft } from '../entities'
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql'
import * as portfolioService from '../services/Porfolio'
import * as nftService from '../services/Nft'

import { Context } from 'apollo-server-core'
import { isAuth } from '../utils'
import { CoinData } from '../types'

@Resolver()
export class PortfolioResolver {
  @Query(() => [Coin])
  @UseMiddleware(isAuth)
  getUserPortfolioCoins(@Ctx() context: Context<any>): Promise<Coin[]> {
    const { payload } = context
    return portfolioService.getUserPortfolioCoins(payload.userId)
  }

  @Query(() => [Coin])
  @UseMiddleware(isAuth)
  getUserPortfolioCoinsBySymbol(@Ctx() context: Context<any>, @Arg('symbol', () => String) symbol: string): Promise<Coin[]> {
    const { payload } = context
    return portfolioService.getUserPortfolioCoinsBySymbol(payload.userId, symbol)
  }

  @Query(() => [Nft])
  // @UseMiddleware(isAuth)
  getUserNfts(@Ctx() context: Context<any>): Promise<Nft[]> {
    const { payload } = context
    return nftService.getUserNfts(payload?.userId || 1)
  }

  @Mutation(() => Coin)
  @UseMiddleware(isAuth)
  async addUserCoin(@Arg('coinData', () => CoinData) coinData: CoinData, @Ctx() context: Context<any>): Promise<Coin> {
    const { payload } = context
    return await portfolioService.addUserCoin(coinData, payload.userId)
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteUserCoin(@Arg('coinData', () => CoinData) coinData: CoinData, @Ctx() context: Context<any>): Promise<boolean> {
    const { payload } = context

    return await portfolioService.deleteUserCoin(coinData, payload.userId)
  }
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteUserCoinBySymbol(@Arg('symbol', () => String) symbol: string, @Ctx() context: Context<any>): Promise<boolean> {
    const { payload } = context

    return await portfolioService.deleteUserCoinBySymbol(symbol, payload.userId)
  }

  @Mutation(() => Coin)
  @UseMiddleware(isAuth)
  async editUserCoin(@Arg('coinData', () => CoinData) coinData: CoinData, @Ctx() context: Context<any>): Promise<Coin> {
    const { payload } = context
    return await portfolioService.editUserCoin(coinData, payload.userId)
  }

  @Mutation(() => Boolean)
  // @UseMiddleware(isAuth)
  async addUserWallet(@Arg('wallet') wallet: string, @Arg('verified') verified: boolean, @Ctx() context: Context<any>): Promise<Boolean> {
    const { payload } = context
    return await nftService.addUserWallet(wallet, verified, payload?.userId || 1)
  }

  @Mutation(() => Boolean)
  // @UseMiddleware(isAuth)
  async removeUserWallet(@Arg('wallet') wallet: string, @Ctx() context: Context<any>): Promise<Boolean> {
    const { payload } = context
    return await nftService.removeUserWallet(wallet, payload?.userId || 1)
  }

  @Mutation(() => Boolean)
  // @UseMiddleware(isAuth)
  async connectWalletCoins(
    @Arg('walletAddress', () => String) walletAddress: string // Update parameter type to string[]
    // @Ctx() context: Context<any>
  ): Promise<Boolean> {
    // const { payload } = context;
    return await portfolioService.connectWalletCoins(walletAddress, 1)
  }
}
