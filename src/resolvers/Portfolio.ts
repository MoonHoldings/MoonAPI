import { Coin } from "../entities";
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import * as portfolioService from '../services/Porfolio'

import { Context } from 'apollo-server-core'
import { isAuth } from "../utils";
import { CoinData } from "../types";

@Resolver()
export class PortfolioResolver {
    @Query(() => [Coin])
    @UseMiddleware(isAuth)
    getUserPortfolioCoins(@Ctx() context: Context<any>): Promise<Coin[]> {
        const { payload } = context;
        return portfolioService.getUserPortfolioCoins(payload.userId)
    }

    @Mutation(() => Coin)
    @UseMiddleware(isAuth)
    async addUserCoin(@Arg('coinData', () => CoinData) coinData: CoinData, @Ctx() context: Context<any>): Promise<Coin> {
        const { payload } = context;
        return await portfolioService.addUserCoin(coinData, payload.userId)
    }

    @Mutation(() => Coin)
    @UseMiddleware(isAuth)
    async editUserCoin(@Arg('coinData', () => CoinData) coinData: CoinData, @Ctx() context: Context<any>): Promise<Coin> {
        const { payload } = context;
        return await portfolioService.editUserCoin(coinData, payload.userId)
    }
}
