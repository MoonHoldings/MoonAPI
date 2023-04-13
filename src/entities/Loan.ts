import { Field, ID, Int, ObjectType } from "type-graphql"
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm"
import { OrderBook } from "./OrderBook"

@ObjectType()
@Entity()
export class Loan extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => String)
  @Column("text")
  pubKey!: string

  @Field(() => Int)
  @Column("integer")
  version!: number

  @Field(() => Number)
  @Column("bigint")
  principalLamports!: number

  @Field(() => OrderBook)
  @ManyToOne(() => OrderBook, (orderBook) => orderBook.loans)
  orderBook!: Relation<OrderBook>

  @Field(() => String)
  @Column("text")
  valueTokenMint!: string

  @Field(() => Boolean, { defaultValue: true })
  @Column({ type: "boolean", default: true })
  supportsFreezingCollateral: boolean = true

  @Field(() => Boolean, { defaultValue: false })
  @Column({ type: "boolean", default: false })
  isCollateralFrozen: boolean = false

  @Field(() => Boolean, { defaultValue: false })
  @Column({ type: "boolean", default: false })
  isHistorical: boolean = false

  @Field(() => Boolean, { defaultValue: false })
  @Column({ type: "boolean", default: false })
  isForeclosable: boolean = false

  @Field(() => String)
  @Column("text")
  state!: string

  @Field(() => Number, { nullable: true })
  @Column("bigint", { nullable: true })
  duration?: number | null

  // Offered loan attributes
  @Field(() => String, { nullable: true })
  @Column({ type: "text", nullable: true })
  lenderWallet?: string

  @Field(() => Number, { nullable: true })
  @Column("bigint", { nullable: true })
  offerTime?: number | null

  // Taken loan attributes
  @Field(() => String, { nullable: true })
  @Column({ type: "text", nullable: true })
  nftCollateralMint?: string

  @Field(() => String, { nullable: true })
  @Column({ type: "text", nullable: true })
  lenderNoteMint?: string

  @Field(() => String, { nullable: true })
  @Column({ type: "text", nullable: true })
  borrowerNoteMint?: string

  @Field(() => Int, { nullable: true })
  @Column("integer", { nullable: true })
  apy?: number | null

  @Field(() => Number, { nullable: true })
  @Column("bigint", { nullable: true })
  start?: number | null

  @Field(() => Number, { nullable: true })
  @Column("bigint", { nullable: true })
  totalOwedLamports?: number | null
}
