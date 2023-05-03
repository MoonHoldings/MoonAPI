import { CoinData } from "../types";
import { Coin, Portfolio, User } from "../entities";
import * as coinService from './Coin'
import { UserInputError } from "apollo-server-express";


export const getUserPortfolioCoins = async (userId: number): Promise<Coin[]> => {
    const user = await User.findOne({
        where: { id: userId },
        relations: {
            portfolio:
                true,

        },
    })
    if (!user) {
        throw new UserInputError('User is not found')
    }
    if (!user.portfolio) {
        const portfolio = new Portfolio();
        portfolio.user = user;
        await portfolio.save();
        user.portfolio = portfolio;
        await user.save();
    }

    return await coinService.getCoinsByPortfolio(user.portfolio);
}


export const addUserCoin = async (coinData: CoinData, userId: number) => {
    const user = await User.findOne({
        where: { id: userId },
        relations: {
            portfolio:
                true,
        },
    })

    if (!user) {
        throw new UserInputError('User is not found')
    }

    if (!user.portfolio) {
        const portfolio = new Portfolio();
        portfolio.user = user;
        await portfolio.save();
        user.portfolio = portfolio;
        await user.save();
    }

    try {
        const coin = new Coin();
        coin.walletAddress = coinData.walletAddress;
        coin.symbol = coinData.symbol;
        coin.name = coinData.name;
        coin.portfolio = user.portfolio
        return await coin.save()
    }
    catch (error) {
        throw new UserInputError(error)
    }
}

export const editUserCoin = async (coinData: CoinData, userId: number) => {
    const user = await User.findOne({
        where: { id: userId },
        relations: {
            portfolio:
                true,
        },
    })

    if (!user) {
        throw new UserInputError('User is not found.')
    }

    if (!user.portfolio) {
        throw new UserInputError("Portfolio not found.")
    }

    try {
        return coinService.updateCoinData(coinData, user.portfolio)
    }
    catch (error) {
        throw new UserInputError(error)
    }
}
