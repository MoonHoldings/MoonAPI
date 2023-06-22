import { User, UserWallet } from '../entities'
import { saveNfts } from './Nft'
import { UserWalletType } from '../types'

import { connectCoins } from './Coin'

export const getUserWallets = async (type: UserWalletType, userId?: number): Promise<UserWallet[]> => {
  return await UserWallet.find({ where: { user: { id: userId }, hidden: false, type } })
}

export const refreshUserWallets = async (userId: number): Promise<boolean> => {
  const userWallets = await UserWallet.find({ where: { user: { id: userId }, hidden: false, type: UserWalletType.Auto } })

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

export const addUserWallet = async (wallet: string, verified: boolean, userId?: number): Promise<boolean> => {
  // Check if user exists
  const user = await User.findOne({ where: { id: userId } })

  if (!user) return false

  // Create user wallet
  const userWallet = await UserWallet.findOne({ where: { user: { id: userId }, address: wallet } })

  if (!userWallet) {
    // If the wallet is not yet added to the user
    if (verified) {
      // If attempting to add a verified wallet (connected a wallet), and it already exists, dont create
      const walletEntity = await UserWallet.findOne({ where: { address: wallet, verified } })

      if (walletEntity) return false
    }

    await UserWallet.create({
      address: wallet,
      verified,
      user: { id: userId },
      type: UserWalletType.Auto,
    }).save()
  } else if (userWallet.verified && userWallet.hidden) {
    userWallet.hidden = false
    await userWallet.save()
  } else if (verified && !userWallet.verified) {
    userWallet.verified = true
    userWallet.hidden = false
    await userWallet.save()
  } else if (verified && userWallet.verified) {
    return true
  } else {
    return false
  }

  // Call save nfts and coins, put inside background job
  await saveNfts(wallet)
  await connectCoins(wallet)

  return true
}

export const checkExistingWallet = async (userId: number, walletType: string, walletName?: string, walletAddress?: string): Promise<UserWallet> => {
  const whereCondition = {
    user: { id: userId },
    ...(walletName ? { name: walletName } : {}),
    ...(walletAddress ? { address: walletAddress } : {}),
  }

  const userWallet = await UserWallet.findOne({ where: whereCondition })

  if (!userWallet) {
    return await UserWallet.create({
      ...(walletName ? { name: walletName } : {}),
      ...(walletAddress ? { address: walletAddress } : {}),
      verified: true,
      user: { id: userId },
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

export const removeAllUserWallets = async (userId?: number): Promise<boolean> => {
  const userWallets = await UserWallet.find({ where: { user: { id: userId }, type: UserWalletType.Auto } })
  const verifiedWallets: UserWallet[] = []

  userWallets.forEach(async (wallet) => {
    if (wallet.verified) {
      wallet.hidden = true
      verifiedWallets.push(wallet)
    } else {
      await wallet.remove()
    }
  })

  if (verifiedWallets.length) await UserWallet.save(verifiedWallets)

  return true
}
