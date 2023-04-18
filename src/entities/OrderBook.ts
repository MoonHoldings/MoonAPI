import { Field, ID, Int, ObjectType } from 'type-graphql'
import { BaseEntity, Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { Loan, NftList } from '.'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { LoanType } from '../types'
import apyAfterFee from '../utils/apyAfterFee'

@ObjectType()
@Entity()
export class OrderBook extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => String)
  @Column('text', { unique: true })
  pubKey!: string

  @Field(() => Int)
  @Column('integer')
  version!: number

  @Field(() => Int, { nullable: true })
  @Column('integer', { nullable: true })
  apy!: number

  @Field(() => Number)
  apyAfterFee(): number {
    return apyAfterFee(this.apy, this.duration, this.feePermillicentage)
  }

  @Field(() => String)
  @Column('text')
  listAccount!: string

  @Field(() => Int, { nullable: true })
  @Column('integer', { nullable: true })
  duration!: number

  @Field(() => Int, { nullable: true })
  @Column('integer', { nullable: true })
  feePermillicentage!: number

  @Field(() => String)
  @Column('text')
  feeAuthority!: string

  @Field(() => [Loan], { nullable: true })
  @OneToMany(() => Loan, (loan) => loan.orderBook, {
    cascade: true,
  })
  loans!: Relation<Loan>[]

  @Field(() => NftList, { nullable: true })
  @OneToOne(() => NftList, (nftList) => nftList.orderBook, { nullable: true })
  @JoinColumn()
  nftList?: Relation<NftList>

  @Field(() => Number)
  async bestOffer(): Promise<number> {
    const query = Loan.createQueryBuilder('loan')
      .select('MAX(loan.principalLamports)', 'bestOffer')
      .where('loan.orderBookId = :id', { id: this.id })
      .andWhere('loan.state = :state', { state: LoanType.Offer })

    const { bestOffer } = await query.getRawOne()

    return bestOffer ? parseInt(bestOffer) / LAMPORTS_PER_SOL : 0
  }

  @Field(() => Number)
  async totalPool(): Promise<number> {
    const query = Loan.createQueryBuilder('loan')
      .select('SUM(loan.principalLamports)', 'totalPool')
      .where('loan.orderBookId = :id', { id: this.id })
      .andWhere('loan.state = :state', { state: LoanType.Offer })

    const { totalPool } = await query.getRawOne()

    return totalPool ? parseInt(totalPool) / LAMPORTS_PER_SOL : 0
  }

  @Field(() => Number)
  async totalActiveLoans(): Promise<number> {
    const query = Loan.createQueryBuilder('loan')
      .select('SUM(loan.principalLamports)', 'totalActiveLoans')
      .where('loan.orderBookId = :id', { id: this.id })
      .andWhere('loan.state = :state', { state: LoanType.Taken })

    const { totalActiveLoans } = await query.getRawOne()

    return totalActiveLoans ? parseInt(totalActiveLoans) / LAMPORTS_PER_SOL : 0
  }

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
