import { In } from 'typeorm'
import { User, UserWallet } from '../entities'
import { saveNfts } from './Nft'
import { UserWalletType } from '../types'
import { connectCoins } from './Coin'
import { getUserByAddress } from './Porfolio'
import { GraphQLError } from 'graphql'
import { ApolloServerErrorCode } from '@apollo/server/errors'

export const getUserWallets = async (type: UserWalletType, userId?: number): Promise<UserWallet[]> => {
  return await UserWallet.find({ where: { user: { id: userId }, hidden: false, type } })
}

export const getExchangeWallets = async (walletAddress: string): Promise<UserWallet[]> => {
  const user = await getUserByAddress(walletAddress)

  return await UserWallet.find({ where: { user: { id: user.id }, hidden: false, type: UserWalletType.Exchange } })
}

//hide exchange wallet if existing
export const removeExchangeWallet = async (walletAddress: string, exchangeAddress?: string): Promise<boolean> => {
  const user = await getUserByAddress(walletAddress)
  const verifiedWallets: UserWallet[] = []
  if (typeof exchangeAddress != null) {
    const wallet = await UserWallet.findOne({ where: { user: { id: user.id }, hidden: false, type: UserWalletType.Exchange, address: exchangeAddress } })
    if (!wallet) {
      throw new GraphQLError('Wallet not found', {
        extensions: {
          code: ApolloServerErrorCode.BAD_USER_INPUT,
        },
      })
    }

    if (!wallet.hidden) {
      wallet.hidden = true
      await wallet.save()
    }
  } else {
    const wallets = await UserWallet.find({ where: { user: { id: user.id }, hidden: false, type: UserWalletType.Exchange } })

    wallets.forEach(async (wallet) => {
      if (!wallet.hidden) {
        wallet.hidden = true
      }
      verifiedWallets.push(wallet)
    })

    if (verifiedWallets.length) await UserWallet.save(verifiedWallets)
  }
  return true
}

export const refreshUserWallets = async (wallets: string[]): Promise<boolean> => {
  const userWallets = await UserWallet.find({ where: { address: In(wallets), hidden: false, type: UserWalletType.Auto } })

  if (userWallets.length) {
    const saveNftsPromises = userWallets.map(async (wallet) => {
      return await saveNfts(wallet.address)
    })

    const saveCoinsPromises = userWallets.map(async (wallet) => {
      return await connectCoins(wallet.address)
    })

    await Promise.allSettled([...saveNftsPromises, ...saveCoinsPromises])
  } else {
    return false
  }

  return true
}

export const addUserWallet = async (wallet: string, verified: boolean): Promise<boolean> => {
  const userWallet = await UserWallet.findOne({ where: { address: wallet } })
  const user = verified && !userWallet?.verified ? await User.create().save() : null

  if (!userWallet) {
    await UserWallet.create({
      address: wallet,
      verified,
      user,
      type: UserWalletType.Auto,
    }).save()
  } else if (!userWallet.verified) {
    userWallet.verified = verified
    userWallet.user = user
    await userWallet.save()
  }

  // Call save nfts and coins, put inside background job
  await saveNfts(wallet)
  await connectCoins(wallet)

  return true
}

export const checkExistingWallet = async (userObject: User, walletType: string, walletName?: string, walletAddress?: string): Promise<UserWallet> => {
  const whereCondition = {
    user: { id: userObject.id },
    type: walletType,
    ...(walletName ? { name: walletName } : {}),
    ...(walletAddress ? { address: walletAddress } : {}),
  }

  const userWallet = await UserWallet.findOne({ where: whereCondition })

  if (!userWallet) {
    return await UserWallet.create({
      ...(walletName ? { name: walletName } : {}),
      ...(walletAddress ? { address: walletAddress } : {}),
      verified: true,
      user: userObject,
      type: walletType,
    }).save()
  } else {
    if (userWallet.hidden) {
      userWallet.hidden = false
      await userWallet.save()
    }
    return userWallet
  }
}

export const updateWallet = async (walletId: number, walletName: string, userId: number): Promise<UserWallet> => {
  const userWallet = await UserWallet.findOne({ where: { id: walletId, user: { id: userId } } })

  if (!userWallet) {
    throw new Error('User wallet not found')
  }

  const existingWallet = await UserWallet.findOne({ where: { name: walletName, user: { id: userId } } })

  if (existingWallet) {
    return existingWallet
  }

  userWallet.name = walletName

  return await userWallet.save()
}

export const removeUserWallet = async (wallet: string, userId?: number): Promise<boolean> => {
  const userWallet = await UserWallet.findOne({ where: { address: wallet, user: { id: userId } } })

  if (userWallet) {
    if (userWallet.verified) {
      userWallet.hidden = true

      await userWallet.save()
    } else {
      await userWallet.remove()
    }

    return true
  }

  return false
}

export const removeAllUserWallets = async (userId?: number, isExchange?: boolean): Promise<boolean> => {
  const userWallets = await UserWallet.find({ where: { user: { id: userId }, type: UserWalletType.Auto } })
  const verifiedWallets: UserWallet[] = []

  userWallets.forEach(async (wallet) => {
    if (wallet.verified) {
      if (isExchange) {
        if (wallet.name && wallet.address) {
          wallet.hidden = true
        }
      } else {
        if (wallet.address && wallet.name === null) {
          wallet.hidden = true
        }
      }
      verifiedWallets.push(wallet)
    } else {
      if (!isExchange) await wallet.remove()
    }
  })

  if (verifiedWallets.length) await UserWallet.save(verifiedWallets)

  return true
}
