import { Field, ID, Int, ObjectType } from "type-graphql"
import { BaseEntity, Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation, JoinColumn } from "typeorm"
import { Loan } from "./Loan"
import { NftList } from "./NftList"

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
}
