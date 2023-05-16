import { UserInputError } from 'apollo-server-express'
import { User, UserWallet } from '../entities'
import { saveNfts } from './Nft'

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
    }).save()
  } else {
    if (userWallet.verified && userWallet.hidden) {
      userWallet.hidden = false

      await userWallet.save()
    } else {
      return false
    }
  }

  // Call save nfts, put inside background job
  await saveNfts(wallet)
  // TODO: Call save coins

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
    return userWallet
  }
}

export const updateWallet = async (walletId: number, walletName: string, userId: number): Promise<UserWallet> => {
  const userWallet = await UserWallet.findOne({ where: { id: walletId, user: { id: userId } } })

  if (!userWallet) {
    throw new UserInputError('User wallet not found')
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
