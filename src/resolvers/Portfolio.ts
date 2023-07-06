import { Coin, Nft, UserWallet } from '../entities'
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql'
import * as portfolioService from '../services/Porfolio'
import * as walletService from '../services/Wallet'
import * as nftService from '../services/Nft'
import { isAuth } from '../utils'
import { CoinData, CoinResponse, ExchangeInfo, UserWalletType } from '../types'

import { AccountsGetRequest, CountryCode, Products } from 'plaid'
import { client } from '../utils/plaid'
import { GraphQLError } from 'graphql'
import { ApolloServerErrorCode } from '@apollo/server/errors'

@Resolver()
export class PortfolioResolver {
  @Query(() => [Coin])
  @UseMiddleware(isAuth)
  getUserPortfolioCoins(@Ctx() context: any): Promise<Coin[]> {
    const { payload } = context

    return portfolioService.getUserPortfolioCoins(payload.userId)
  }

  @Query(() => CoinResponse)
  @UseMiddleware(isAuth)
  getUserPortfolioCoinsBySymbol(@Ctx() context: any, @Arg('symbol', () => String) symbol: string): Promise<CoinResponse> {
    const { payload } = context
    return portfolioService.getUserPortfolioCoinsBySymbol(payload.userId, symbol)
  }

  @Query(() => [UserWallet])
  @UseMiddleware(isAuth)
  getUserWallets(@Arg('type') type: UserWalletType, @Ctx() context: any): Promise<UserWallet[]> {
    const { payload } = context
    return walletService.getUserWallets(type, payload?.userId)
  }

  @Query(() => [Nft])
  @UseMiddleware(isAuth)
  getUserNfts(@Ctx() context: any): Promise<Nft[]> {
    const { payload } = context
    return nftService.getUserNfts(payload?.userId)
  }

  @Mutation(() => Coin)
  @UseMiddleware(isAuth)
  async addUserCoin(@Arg('coinData', () => CoinData) coinData: CoinData, @Ctx() context: any): Promise<Coin> {
    const { payload } = context
    return await portfolioService.addUserCoin(coinData, payload.userId)
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async addExchangeCoins(@Arg('exchangeInfo', { nullable: true }) exchangeInfo: ExchangeInfo, @Ctx() context: any): Promise<boolean> {
    const { payload } = context

    return await portfolioService.addExchangeCoins(exchangeInfo, payload.userId)
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteUserCoin(@Arg('coinData', () => CoinData) coinData: CoinData, @Ctx() context: any): Promise<boolean> {
    const { payload } = context

    return await portfolioService.deleteUserCoin(coinData, payload.userId)
  }
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteUserCoinBySymbol(@Arg('symbol', () => String) symbol: string, @Ctx() context: any): Promise<boolean> {
    const { payload } = context

    return await portfolioService.deleteUserCoinBySymbol(symbol, payload.userId)
  }

  @Mutation(() => Coin)
  @UseMiddleware(isAuth)
  async editUserCoin(@Arg('coinData', () => CoinData) coinData: CoinData, @Ctx() context: any): Promise<Coin> {
    const { payload } = context
    return await portfolioService.editUserCoin(coinData, payload.userId)
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async addUserWallet(@Arg('wallet') wallet: string, @Arg('verified') verified: boolean, @Ctx() context: any): Promise<Boolean> {
    const { payload } = context
    return await walletService.addUserWallet(wallet, verified, payload?.userId)
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
  @UseMiddleware(isAuth)
  async refreshUserWallets(@Ctx() context: any): Promise<Boolean> {
    const { payload } = context
    return await walletService.refreshUserWallets(payload?.userId)
  }

  @Query(() => Number)
  @UseMiddleware(isAuth)
  getUserPortfolioTotalByType(@Ctx() context: any, @Arg('type') type: string): Promise<number> {
    const { payload } = context
    return portfolioService.getPortfolioTotalByType(payload?.userId, type)
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  async getPlaidLinkToken(@Ctx() context: any): Promise<string> {
    const { payload } = context
    try {
      const response = await client.linkTokenCreate({
        user: {
          client_user_id: payload?.userId?.toString(),
        },
        client_name: 'Moon Holdings',
        products: [Products.Auth],
        country_codes: [CountryCode.Us],
        language: 'en',
      })

      return response.data.link_token
    } catch (error) {
      throw new GraphQLError('Server error', {
        extensions: {
          code: ApolloServerErrorCode.BAD_USER_INPUT,
        },
      })
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async connectPlaidDetails(@Arg('public_token') public_token: string): Promise<boolean> {
    try {
      const tokenExchangeResponse = await client.itemPublicTokenExchange({
        public_token: public_token,
      })

      const access_token = tokenExchangeResponse.data.access_token
      const request: AccountsGetRequest = {
        access_token: access_token,
      }
      const accountBalancesResponse = await client.accountsBalanceGet(request)

      accountBalancesResponse?.data?.accounts?.forEach((account) => {
        console.log(account.balances)
      })

      //TODO: IMPLEMENT LINKING OF ACTUAL BALANCES

      return true
    } catch (error) {
      throw new GraphQLError('Invalid Token', {
        extensions: {
          code: ApolloServerErrorCode.BAD_USER_INPUT,
        },
      })
    }
  }
}
