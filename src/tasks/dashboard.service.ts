import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { Loan, Nft, WalletData, UserWallet, FXRate } from '../entities'
import { Repository } from 'typeorm'
import calculateOfferInterest from '../utils/calculateOfferInterest'
import calculateBorrowInterest from '../utils/calculateBorrowInterest'
import { InjectRepository } from '@nestjs/typeorm'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { format } from 'date-fns'
import { UserWalletType, WalletDataType } from '../types'
import { getCoinsByWallet } from '../services/Coin'
import * as Sentry from '@sentry/node'
import getFXRate from '../utils/getFXRate'

@Injectable()
export class DashboardService {
  constructor(
    // @ts-ignore
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    // @ts-ignore
    @InjectRepository(UserWallet)
    private readonly userWalletRepository: Repository<UserWallet>,
    // @ts-ignore
    @InjectRepository(WalletData)
    private readonly walletDataRepository: Repository<WalletData>,
    // @ts-ignore
    @InjectRepository(FXRate)
    private readonly fxRateRepository: Repository<FXRate>
  ) {}

  @Cron('0 0 * * *')
  async saveFXRate() {
    const fxRate = await getFXRate('SOL', 'USD')

    console.log('saveFXRate', new Date(), fxRate)

    await this.fxRateRepository
      .create({
        assetIdBase: 'SOL',
        assetIdQuote: 'USD',
        pair: 'SOLUSD',
        rate: fxRate?.rate,
        time: fxRate?.time,
      })
      .save()
  }

  @Cron('0 0 * * *')
  async saveLoansDashboardData() {
    try {
      console.log(format(new Date(), "'saveLoansDashboardData start:' MMMM d, yyyy h:mma"))
      const verifiedWallets = await this.userWalletRepository.find({ where: { type: UserWalletType.Auto, verified: true } })

      const walletLoansTotal = verifiedWallets.map(async (wallet) => {
        const loans = await this.loanRepository.find({ where: { lenderWallet: wallet.address }, relations: { orderBook: true } })
        let total = 0

        if (loans.length) {
          total = loans.reduce((accumulator: number, loan) => {
            return (
              accumulator +
              loan.principalLamports / LAMPORTS_PER_SOL +
              calculateOfferInterest(loan.principalLamports, loan.orderBook.duration, loan.orderBook.apy, loan.orderBook.feePermillicentage) / LAMPORTS_PER_SOL
            )
          }, 0)
        }

        return {
          wallet,
          total,
        }
      })

      const walletsTotal = await Promise.all(walletLoansTotal)
      // const fxRate = await getFXRate('SOL', 'USD')

      const walletData = walletsTotal.map((walletData) =>
        this.walletDataRepository.create({
          total: walletData.total,
          type: WalletDataType.Loan,
          wallet: walletData.wallet,
          assetId: 'SOL',
        })
      )

      if (walletData.length) await this.walletDataRepository.save(walletData)

      console.log(format(new Date(), "'saveLoansDashboardData start:' MMMM d, yyyy h:mma"))
    } catch (error) {
      Sentry.captureException(error)
    }
  }

  @Cron('5 0 * * *')
  async saveBorrowDashboardData() {
    try {
      console.log(format(new Date(), "'saveBorrowDashboardData start:' MMMM d, yyyy h:mma"))
      const verifiedWallets = await this.userWalletRepository.find({ where: { type: UserWalletType.Auto, verified: true } })

      const walletBorrowTotal = verifiedWallets.map(async (wallet) => {
        const loans = await this.loanRepository.find({ where: { borrowerNoteMint: wallet.address }, relations: { orderBook: true } })
        let total = 0

        if (loans.length) {
          total = loans.reduce((accumulator: number, loan) => {
            return accumulator + loan.principalLamports / LAMPORTS_PER_SOL + calculateBorrowInterest(loan.principalLamports, loan.orderBook.duration, loan.orderBook.apy) / LAMPORTS_PER_SOL
          }, 0)
        }

        return {
          wallet,
          total,
        }
      })

      const walletsTotal = await Promise.all(walletBorrowTotal)
      // const fxRate = await getFXRate('SOL', 'USD')

      const walletData = walletsTotal.map((walletData) =>
        this.walletDataRepository.create({
          total: walletData.total,
          type: WalletDataType.Borrow,
          wallet: walletData.wallet,
          assetId: 'SOL',
        })
      )

      if (walletData.length) await this.walletDataRepository.save(walletData)

      console.log(format(new Date(), "'saveBorrowDashboardData end:' MMMM d, yyyy h:mma"))
    } catch (error) {
      Sentry.captureException(error)
    }
  }

  @Cron('10 0 * * *')
  async saveNftDashboardData() {
    try {
      console.log(format(new Date(), "'saveNftDashboardData start:' MMMM d, yyyy h:mma"))
      const userWallets = await this.userWalletRepository.find({ where: { type: UserWalletType.Auto } })

      const userNftValuePromises = userWallets.map(async (wallet) => {
        const nfts = await Nft.find({ where: { owner: wallet.address }, relations: { collection: true } })
        const collectionsHash = nfts.reduce((hash: any, nft) => {
          if (nft.collection && nft.collection.floorPrice) {
            if (nft.collection?.id in hash) {
              hash[nft.collection?.id].count += 1
            } else {
              hash[nft.collection?.id] = {
                collection: nft.collection,
                count: 1,
              }
            }
          }

          return hash
        }, {})

        const total = Object.values(collectionsHash).reduce((currentTotal: number, userCollectionCount: any) => {
          return currentTotal + (userCollectionCount.collection.floorPrice / LAMPORTS_PER_SOL) * userCollectionCount.count
        }, 0)

        return {
          wallet,
          total,
        }
      })

      const walletNftsTotal = await Promise.all(userNftValuePromises)
      // const fxRate = await getFXRate('SOL', 'USD')

      const walletData = walletNftsTotal.map((walletNftTotal) =>
        this.walletDataRepository.create({
          total: walletNftTotal.total,
          type: WalletDataType.Nft,
          wallet: walletNftTotal.wallet,
          assetId: 'SOL',
        })
      )

      if (walletData.length) await this.walletDataRepository.save(walletData)

      console.log(format(new Date(), "'saveNftDashboardData end:' MMMM d, yyyy h:mma"))
    } catch (error) {
      Sentry.captureException(error)
    }
  }

  @Cron('15 0 * * *')
  async saveCryptoDashboardData() {
    try {
      console.log(format(new Date(), "'saveCryptoDashboardData start:' MMMM d, yyyy h:mma"))
      const userWallets = await this.userWalletRepository.find()

      const userCryptoValuePromises = userWallets.map(async (wallet) => {
        const portfolioCoins = await getCoinsByWallet([wallet.address])
        let total = 0

        portfolioCoins.forEach((coin) => {
          const price = parseFloat(coin.price.toString())
          const holdings = coin.holdings

          if (!isNaN(price) && !isNaN(holdings)) {
            total += price * holdings
          }
        })

        return {
          wallet,
          total,
        }
      })

      const userCryptosTotal = await Promise.all(userCryptoValuePromises)

      const walletData = userCryptosTotal.map((userCryptoTotal) =>
        this.walletDataRepository.create({
          total: userCryptoTotal.total,
          type: WalletDataType.Crypto,
          wallet: userCryptoTotal.wallet,
          assetId: 'USD',
        })
      )

      if (walletData.length) await this.walletDataRepository.save(walletData)

      console.log(format(new Date(), "'saveCryptoDashboardData end:' MMMM d, yyyy h:mma"))
    } catch (error) {
      Sentry.captureException(error)
    }
  }
}
