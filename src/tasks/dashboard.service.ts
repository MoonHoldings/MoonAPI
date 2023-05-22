import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { Loan, Nft, User, UserDashboard, UserWallet } from '../entities'
import { In, Repository } from 'typeorm'
import calculateOfferInterest from '../utils/calculateOfferInterest'
import calculateBorrowInterest from '../utils/calculateBorrowInterest'
import { InjectRepository } from '@nestjs/typeorm'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { format } from 'date-fns'
import { UserWalletType } from '../types'

@Injectable()
export class DashboardService {
  constructor(
    // @ts-ignore
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    // @ts-ignore
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    // @ts-ignore
    @InjectRepository(UserWallet)
    private readonly userWalletRepository: Repository<UserWallet>,
    // @ts-ignore
    @InjectRepository(UserDashboard)
    private readonly userDashboardRepository: Repository<UserDashboard>
  ) {}

  @Cron('0 0 * * *')
  async saveLoansDashboardData() {
    console.log(format(new Date(), "'saveLoansDashboardData start:' MMMM d, yyyy h:mma"))
    const users = await this.userRepository.find({ select: ['id'] })

    const userLoansTotalPromises = users.map(async (user) => {
      const verifiedWallets = (await this.userWalletRepository.find({ where: { user: { id: user.id }, verified: true } })).map((wallet) => wallet.address)
      const loans = await this.loanRepository.find({ where: { lenderWallet: In(verifiedWallets) }, relations: { orderBook: true } })
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
        user,
        total,
      }
    })

    const userLoansTotal = await Promise.all(userLoansTotalPromises)

    const userDashboards = userLoansTotal.map((userLoanTotal) =>
      this.userDashboardRepository.create({
        total: userLoanTotal.total,
        type: 'loan',
        user: userLoanTotal.user,
      })
    )

    if (userDashboards.length) await this.userDashboardRepository.save(userDashboards)

    console.log(format(new Date(), "'saveLoansDashboardData start:' MMMM d, yyyy h:mma"))
  }

  @Cron('0 0 * * *')
  async saveBorrowDashboardData() {
    console.log(format(new Date(), "'saveBorrowDashboardData start:' MMMM d, yyyy h:mma"))
    const users = await this.userRepository.find({ select: ['id'] })

    const userLoansTotalPromises = users.map(async (user) => {
      const verifiedWallets = (await this.userWalletRepository.find({ where: { user: { id: user.id }, verified: true } })).map((wallet) => wallet.address)
      const loans = await this.loanRepository.find({ where: { borrowerNoteMint: In(verifiedWallets) }, relations: { orderBook: true } })
      let total = 0

      if (loans.length) {
        total = loans.reduce((accumulator: number, loan) => {
          return accumulator + loan.principalLamports / LAMPORTS_PER_SOL + calculateBorrowInterest(loan.principalLamports, loan.orderBook.duration, loan.orderBook.apy) / LAMPORTS_PER_SOL
        }, 0)
      }

      return {
        user,
        total,
      }
    })

    const userLoansTotal = await Promise.all(userLoansTotalPromises)

    const userDashboards = userLoansTotal.map((userLoanTotal) =>
      this.userDashboardRepository.create({
        total: userLoanTotal.total,
        type: 'borrow',
        user: userLoanTotal.user,
      })
    )

    if (userDashboards.length) await this.userDashboardRepository.save(userDashboards)

    console.log(format(new Date(), "'saveBorrowDashboardData end:' MMMM d, yyyy h:mma"))
  }

  @Cron('0 0 * * *')
  async saveNftDashboardData() {
    console.log(format(new Date(), "'saveNftDashboardData start:' MMMM d, yyyy h:mma"))
    const users = await this.userRepository.find({ select: ['id'] })

    const userNftValuePromises = users.map(async (user) => {
      const userWallets = await this.userWalletRepository.find({ where: { user: { id: user.id }, type: UserWalletType.Auto } })
      const nfts = await Nft.find({ where: { owner: In(userWallets.map((wallet) => wallet.address)) }, relations: { collection: true } })
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
        user,
        total,
      }
    })

    const userNftsTotal = await Promise.all(userNftValuePromises)

    const userDashboards = userNftsTotal.map((userNftTotal) =>
      this.userDashboardRepository.create({
        total: userNftTotal.total,
        type: 'nft',
        user: userNftTotal.user,
      })
    )

    if (userDashboards.length) await this.userDashboardRepository.save(userDashboards)

    console.log(format(new Date(), "'saveNftDashboardData end:' MMMM d, yyyy h:mma"))
  }
}
