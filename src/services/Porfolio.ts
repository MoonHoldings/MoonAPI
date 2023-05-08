import { CoinData } from "../types";
import { Coin, Portfolio, User } from "../entities";
import * as coinService from './Coin'
import { UserInputError } from "apollo-server-express";


export const getUserPortfolioCoins = async (userId: number): Promise<Coin[]> => {
    const user = await checkUserPort(userId);

    return await coinService.getCoinsByPortfolio(user.portfolio);
}

export const getUserPortfolioCoinsBySymbol = async (userId: number, symbol: string): Promise<Coin[]> => {
    const user = await checkUserPort(userId);

    return await coinService.getCoinsBySymbol(user.portfolio, symbol);
}


export const addUserCoin = async (coinData: CoinData, userId: number) => {
    const user = await checkUserPort(userId);

    try {
        return await coinService.saveCoinData(coinData, user.portfolio)
    }
    catch (error) {
        throw new UserInputError(error)
    }
}


export const deleteUserCoin = async (coinData: CoinData, userId: number) => {
    const user = await checkUserPort(userId);

    try {
        return coinService.deleteCoinData(coinData, user.portfolio);
    }
    catch (error) {
        console.log("3333")
        throw new UserInputError(error)
    }
}

export const editUserCoin = async (coinData: CoinData, userId: number) => {

    const user = await checkUserPort(userId, true);

    try {
        return coinService.updateCoinData(coinData, user.portfolio)
    }
    catch (error) {
        throw new UserInputError(error)
    }
}


const checkUserPort = async (userId: number, isEdit?: boolean) => {
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

    if (!user.portfolio && isEdit) {
        throw new UserInputError("Portfolio not found.")
    }
    else if (!user.portfolio && !isEdit) {
        const portfolio = new Portfolio();
        portfolio.user = user;
        await portfolio.save();
        user.portfolio = portfolio;
        await user.save();
    }

    return user
}