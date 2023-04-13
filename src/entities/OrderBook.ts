import { Field, ID, Int, ObjectType } from "type-graphql"
import { BaseEntity, Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation, JoinColumn } from "typeorm"
import { Loan } from "./Loan"
import { NftList } from "./NftList"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { LoanType } from "../types"

@ObjectType()
@Entity()
export class OrderBook extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => String)
  @Column("text", { unique: true })
  pubKey!: string

  @Field(() => Int)
  @Column("integer")
  version!: number

  @Field(() => Int, { nullable: true })
  @Column("integer", { nullable: true })
  apy!: number

  @Field(() => Number)
  apyAfterFee(): number {
    const aprBeforeFee = this.apy / 1000
    const interestRatioBeforeFee = Math.exp((this.duration / (365 * 24 * 60 * 60)) * (aprBeforeFee / 100)) - 1
    const interestRatioAfterFee = interestRatioBeforeFee * (1 - this.feePermillicentage / 100_000)
    const aprAfterFee = (Math.log(1 + interestRatioAfterFee) / (this.duration / (365 * 24 * 60 * 60))) * 100

    return Math.ceil(100 * (Math.exp(aprAfterFee / 100) - 1))
  }

  @Field(() => String)
  @Column("text")
  listAccount!: string

  @Field(() => Int, { nullable: true })
  @Column("integer", { nullable: true })
  duration!: number

  @Field(() => Int, { nullable: true })
  @Column("integer", { nullable: true })
  feePermillicentage!: number

  @Field(() => String)
  @Column("text")
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
    const query = Loan.createQueryBuilder("loan")
      .select("MAX(loan.principalLamports)", "bestOffer")
      .where("loan.orderBookId = :id", { id: this.id })
      .andWhere("loan.state = :state", { state: LoanType.Offer })

    const { bestOffer } = await query.getRawOne()

    return bestOffer ? parseInt(bestOffer) / LAMPORTS_PER_SOL : 0
  }

  @Field(() => Number)
  async totalPool(): Promise<number> {
    const query = Loan.createQueryBuilder("loan")
      .select("SUM(loan.principalLamports)", "totalPool")
      .where("loan.orderBookId = :id", { id: this.id })
      .andWhere("loan.state = :state", { state: LoanType.Offer })

    const { totalPool } = await query.getRawOne()

    return totalPool ? parseInt(totalPool) / LAMPORTS_PER_SOL : 0
  }
}
