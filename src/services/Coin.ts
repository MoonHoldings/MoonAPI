
import { UserInputError } from 'apollo-server-express';
import { Coin, User } from '../entities';
import { CoinData } from '../types';
import { shyft } from "../utils/shyft";
import { pythCoins } from "../utils/pythCoins";


export const getCoinsByUserId = async (user: User): Promise<Coin[]> => {
    const coins = await Coin.find({ where: { user: { id: user.id } } })
    const mergedCoins: { [symbol: string]: Coin } = {};

    coins.forEach((coin) => {
        const symbol = coin.symbol;
        if (!mergedCoins[symbol]) {
            mergedCoins[symbol] = coin;
            mergedCoins[symbol].holdings = parseFloat(coin.holdings.toString());

        } else {
            mergedCoins[symbol].holdings = parseFloat(mergedCoins[symbol].holdings.toString()) + parseFloat(coin.holdings.toString());
        }
    });

    return Object.values(mergedCoins);
};

export const getCoinsBySymbol = async (user: User, symbol: string): Promise<Coin[]> => {
    const coins = await Coin.find({ where: { user: { id: user.id }, symbol } })
    return coins;
};

export const updateCoinData = async (editCoin: CoinData, user: User): Promise<Coin> => {
    const coin = await Coin.findOne({ where: { id: editCoin.id, user: { id: user.id } } })

    if (!coin) {
        throw new UserInputError("Coin not found")
    }
    coin.name = editCoin.name;
    coin.symbol = editCoin.symbol;
    coin.walletName = editCoin.walletName;
    coin.holdings = editCoin.holdings;
    return await coin.save();
};


export const saveCoinData = async (coinData: CoinData, user: User, walletAddress?: string): Promise<Coin> => {
    const coin = new Coin();
    coin.walletName = coinData.walletName;
    coin.symbol = coinData.symbol;
    coin.name = coinData.name;
    coin.holdings = coinData.holdings;
    coin.user = user;
    if (walletAddress) {
        coin.walletAddress = walletAddress
        coin.verified = true
    }
    return await coin.save()
};

export const deleteCoinData = async (coinData: CoinData, user: User): Promise<boolean> => {
    const coin = await Coin.findOne({ where: { id: coinData.id, user: { id: user.id } } })
    if (!coin) {
        throw new UserInputError("Coin not found")
    }

    try {
        await coin.remove()
        return true;
    } catch (error) {
        throw new UserInputError(error)
    }
};

export const connectCoins = async (walletAddress: string, user: User): Promise<boolean> => {
    try {
        const balances = await shyft.wallet.getAllTokenBalance({ wallet: walletAddress });
        for (const balance of balances) {
            const matchingCoin = pythCoins.find(coin => coin.name.toLowerCase() === balance.info.name.toLowerCase());
            if (matchingCoin && balance.balance > 0) {
                const newCoin = new CoinData();
                newCoin.symbol = balance.info.symbol;
                newCoin.name = balance.info.name;
                newCoin.holdings = balance.balance;
                const isExisting = await checkExistingCoin(newCoin, user, walletAddress)
                if (!isExisting)
                    saveCoinData(newCoin, user, walletAddress);
            }
        }
        return true
    }
    catch (error) {
        throw new UserInputError(error)
    }
};

export const checkExistingCoin = async (coinData: CoinData, user: User, walletAddress: string) => {
    const coin = await Coin.findOne({ where: { walletAddress: walletAddress, user: { id: user.id } } })
    if (!coin) {
        return false
    }
    else {
        coin.walletName = coinData.walletName;
        coin.symbol = coinData.symbol;
        coin.name = coinData.name;
        coin.holdings = coinData.holdings;
        coin.user = user;
        coin.walletAddress = walletAddress
        coin.verified = true
        await coin.save()
        return true
    }
}