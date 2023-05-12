import { Coin } from "../entities";
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import * as portfolioService from '../services/Porfolio'

import { Context } from 'apollo-server-core'
import { isAuth } from "../utils";
import { CoinData, WalletPortfolio } from "../types";

@Resolver()
export class PortfolioResolver {
    @Query(() => [Coin])
    @UseMiddleware(isAuth)
    getUserPortfolioCoins(@Ctx() context: Context<any>): Promise<Coin[]> {
        const { payload } = context;
        return portfolioService.getUserPortfolioCoins(payload.userId)
    }

    @Query(() => [Coin])
    @UseMiddleware(isAuth)
    getUserPortfolioCoinsBySymbol(@Ctx() context: Context<any>, @Arg('symbol', () => String) symbol: string): Promise<Coin[]> {
        const { payload } = context;
        return portfolioService.getUserPortfolioCoinsBySymbol(payload.userId, symbol)
    }

    @Mutation(() => Coin)
    @UseMiddleware(isAuth)
    async addUserCoin(@Arg('coinData', () => CoinData) coinData: CoinData, @Ctx() context: Context<any>): Promise<Coin> {
        const { payload } = context;
        return await portfolioService.addUserCoin(coinData, payload.userId)
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deleteUserCoin(@Arg('coinData', () => CoinData) coinData: CoinData, @Ctx() context: Context<any>): Promise<boolean> {
        const { payload } = context;

        return await portfolioService.deleteUserCoin(coinData, payload.userId)
    }

    @Mutation(() => Coin)
    @UseMiddleware(isAuth)
    async editUserCoin(@Arg('coinData', () => CoinData) coinData: CoinData, @Ctx() context: Context<any>): Promise<Coin> {
        const { payload } = context;
        return await portfolioService.editUserCoin(coinData, payload.userId)
    }

    @Mutation(() => Coin)
    // @UseMiddleware(isAuth)
    async connectWalletCoins(
        @Arg('walletAddress', () => String) walletAddress: string, // Update parameter type to string[]
        @Ctx() context: Context<any>
    ): Promise<WalletPortfolio> { // Update return type to string[]
        // const { payload } = context;
        await portfolioService.connectWalletCoins(walletAddress, 1);
        return new WalletPortfolio()
    }
}
