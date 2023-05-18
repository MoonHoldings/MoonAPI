import { UserInputError } from 'apollo-server-express'
import { Coin, User, UserWallet } from '../entities'
import { CoinData, UserWalletType } from '../types'
// import { shyft } from '../utils/shyft'
// import { pythCoins } from '../utils/pythCoins'
import { In } from 'typeorm'

export const getCoinsByUser = async (user: User): Promise<Coin[]> => {
  const manualUserWallets = await UserWallet.find({ where: { user: { id: user.id }, hidden: false, type: UserWalletType.Manual } })
  const autoUserWallets = await UserWallet.find({ where: { user: { id: user.id }, hidden: false, type: UserWalletType.Auto } })
  const manualCoins = await Coin.find({
    where: [{ walletId: In(manualUserWallets.map((wallet) => wallet.id)) }],
  })
  const autoCoins = await Coin.find({
    where: [{ walletAddress: In(autoUserWallets.map((wallet) => wallet.address)) }],
  })
  const mergedCoins: { [symbol: string]: Coin } = {}
  const coins = manualCoins.concat(autoCoins)

  coins.forEach((coin) => {
    const symbol = coin.symbol
    if (!mergedCoins[symbol]) {
      mergedCoins[symbol] = coin
      mergedCoins[symbol].holdings = parseFloat(coin.holdings.toString())
    } else {
      mergedCoins[symbol].holdings = parseFloat(mergedCoins[symbol].holdings.toString()) + parseFloat(coin.holdings.toString())
    }
  })

  return Object.values(mergedCoins)
}

export const getCoinsBySymbol = async (user: User, symbol: string): Promise<Coin[]> => {
  const userWallets = await UserWallet.find({ where: { user: { id: user.id }, hidden: false } })

  const coins = await Coin.find({
    where: [{ walletId: In(userWallets.map((wallet) => wallet.id)), symbol }],
  })
  return coins
}

export const updateCoinData = async (editCoin: CoinData, user: User): Promise<Coin> => {
  const coin = await Coin.findOne({
    where: { id: editCoin.id },
  })

  if (!coin) {
    throw new UserInputError('Coin not found')
  }

  const userWallet = await UserWallet.find({ where: { user: { id: user.id }, name: coin.walletName, type: UserWalletType.Manual } })
  if (!userWallet) {
    throw new UserInputError('Wallet Not owned by user.')
  }

  coin.walletName = editCoin.walletName
  coin.holdings = editCoin.holdings
  return await coin.save()
}

export const saveCoinData = async (coinData: CoinData, userWallet: UserWallet): Promise<Coin> => {
  const newCoin = new Coin()
  newCoin.symbol = coinData.symbol
  newCoin.name = coinData.name
  newCoin.holdings = coinData.holdings
  newCoin.walletId = userWallet.id
  newCoin.walletName = userWallet.name ?? null
  newCoin.walletAddress = userWallet.address ?? null
  newCoin.verified = userWallet.verified
  return await newCoin.save()
}

export const deleteCoinData = async (coinData: CoinData, user: User): Promise<boolean> => {
  const coin = await Coin.findOne({
    where: { id: coinData.id },
  })

  if (!coin) {
    throw new UserInputError('Coin not found')
  }
  const userWallet = await UserWallet.find({ where: { user: { id: user.id }, id: coin.walletId, type: UserWalletType.Manual } })

  if (!userWallet) {
    throw new UserInputError('User wallet not owned')
  }
  try {
    await coin.remove()
    return true
  } catch (error) {
    throw new UserInputError(error)
  }
}

export const deleteCoinDataBySymbol = async (symbol: string, user: User): Promise<boolean> => {
  const userWallets = await UserWallet.find({ where: { user: { id: user.id }, hidden: false, type: UserWalletType.Manual } })
  const coins = await Coin.find({
    where: [{ walletId: In(userWallets.map((wallet) => wallet.id)), symbol: symbol }],
  })
  if (!coins) {
    throw new UserInputError('Coins not found')
  }

  try {
    for (const coin of coins) {
      await coin.remove()
    }
    return true
  } catch (error) {
    throw new UserInputError(error)
  }
}

// export const connectCoins = async (walletAddress: string): Promise<boolean> => {
//   try {
//     const balances = await shyft.wallet.getAllTokenBalance({ wallet: walletAddress })
//     for (const balance of balances) {
//       const matchingCoin = pythCoins.find((coin) => coin.name.toLowerCase() === balance.info.name.toLowerCase())
//       if (matchingCoin && balance.balance > 0) {
//         const newCoin = new CoinData()
//         newCoin.symbol = balance.info.symbol
//         newCoin.name = balance.info.name
//         newCoin.holdings = balance.balance
//         const isExisting = await checkExistingCoin(newCoin, user, walletAddress)
//         if (!isExisting) saveCoinData(newCoin, user, walletAddress)
//       }
//     }
//     return true
//   } catch (error) {
//     throw new UserInputError(error)
//   }
// }

// export const checkExistingCoin = async (coinData: CoinData, user: User, walletAddress: string) => {
//   const coin = await Coin.findOne({ where: { walletAddress: walletAddress, user: { id: user.id } } })
//   if (!coin) {
//     return false
//   } else {
//     coin.walletName = coinData.walletName
//     coin.symbol = coinData.symbol
//     coin.name = coinData.name
//     coin.holdings = coinData.holdings
//     coin.user = user
//     coin.walletAddress = walletAddress
//     coin.verified = true
//     await coin.save()
//     return true
//   }
// }
