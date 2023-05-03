
import { UserInputError } from 'apollo-server-express';
import { Coin, Portfolio } from '../entities';
import { CoinData } from 'src/types';

export const getCoinsByPortfolio = async (portfolio: Portfolio): Promise<Coin[]> => {
    const coins = await Coin.find({ where: { portfolio: { id: portfolio.id } } })
    return coins;
};

export const updateCoinData = async (editCoin: CoinData, portfolio: Portfolio): Promise<Coin> => {
    const coin = await Coin.findOne({ where: { id: editCoin.id, portfolio: { id: portfolio.id } } })

    if (!coin) {
        throw new UserInputError("Coin not found")
    }
    coin.name = editCoin.name;
    coin.symbol = editCoin.symbol;
    coin.walletAddress = editCoin.walletAddress;
    return await coin.save();
};
