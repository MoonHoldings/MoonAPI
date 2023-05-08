
import { UserInputError } from 'apollo-server-express';
import { Coin, Portfolio } from '../entities';
import { CoinData } from 'src/types';

export const getCoinsByPortfolio = async (portfolio: Portfolio): Promise<Coin[]> => {
    const coins = await Coin.find({ where: { portfolio: { id: portfolio.id } } })
    const mergedCoins: { [symbol: string]: Coin } = {};

    coins.forEach((coin) => {
        const symbol = coin.symbol;
        if (!mergedCoins[symbol]) {
            mergedCoins[symbol] = coin;
        } else {
            mergedCoins[symbol].holdings = parseInt(mergedCoins[symbol].holdings.toString()) + parseInt(coin.holdings.toString());
        }
    });

    return Object.values(mergedCoins);
};

export const getCoinsBySymbol = async (portfolio: Portfolio, symbol: string): Promise<Coin[]> => {
    const coins = await Coin.find({ where: { portfolio: { id: portfolio.id }, symbol } })
    return coins;
};

export const updateCoinData = async (editCoin: CoinData, portfolio: Portfolio): Promise<Coin> => {
    const coin = await Coin.findOne({ where: { id: editCoin.id, portfolio: { id: portfolio.id } } })

    if (!coin) {
        throw new UserInputError("Coin not found")
    }
    coin.name = editCoin.name;
    coin.symbol = editCoin.symbol;
    coin.walletName = editCoin.walletName;
    coin.holdings = editCoin.holdings;
    return await coin.save();
};


export const saveCoinData = async (coinData: CoinData, portfolio: Portfolio): Promise<Coin> => {
    const coin = new Coin();
    coin.walletName = coinData.walletName;
    coin.symbol = coinData.symbol;
    coin.name = coinData.name;
    coin.holdings = coinData.holdings;
    coin.portfolio = portfolio
    return await coin.save()
};

export const deleteCoinData = async (coinData: CoinData, portfolio: Portfolio): Promise<boolean> => {
    const coin = await Coin.findOne({ where: { id: coinData.id, portfolio: { id: portfolio.id } } })
    if (!coin) {
        throw new UserInputError("Coin not found")
    }

    try {
        await coin.remove()
        return true;
    }
    catch (error) {
        throw new UserInputError(error)
    }
};
