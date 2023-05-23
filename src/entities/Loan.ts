import { Field, ID, Int, ObjectType } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from 'typeorm'
import { OrderBook } from '.'

@ObjectType()
@Entity()
export class Loan extends BaseEntity {
  @Index()
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number

  @Index()
  @Field(() => String)
  @Column('varchar')
  pubKey!: string

  @Field(() => Int)
  @Column('integer')
  version!: number

  @Field(() => Number)
  @Column('bigint')
  principalLamports!: number

  @Field(() => OrderBook, { nullable: true })
  @ManyToOne(() => OrderBook, (orderBook) => orderBook.loans)
  orderBook!: Relation<OrderBook>

  @Field(() => String)
  @Column('varchar')
  valueTokenMint!: string

  @Field(() => Boolean, { defaultValue: true })
  @Column({ type: 'boolean', default: true })
  supportsFreezingCollateral: boolean = true

  @Field(() => Boolean, { defaultValue: false })
  @Column({ type: 'boolean', default: false })
  isCollateralFrozen: boolean = false

  @Field(() => Boolean, { defaultValue: false })
  @Column({ type: 'boolean', default: false })
  isHistorical: boolean = false

  @Field(() => Boolean, { defaultValue: false })
  @Column({ type: 'boolean', default: false })
  isForeclosable: boolean = false

  @Field(() => String)
  @Column('varchar')
  state!: string

  @Field(() => Number, { nullable: true })
  @Column('bigint', { nullable: true })
  duration?: number | null

  // Offered loan attributes
  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', nullable: true })
  lenderWallet?: string | null

  @Field(() => Number, { nullable: true })
  @Column('bigint', { nullable: true })
  offerTime?: number | null

  // Taken loan attributes
  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', nullable: true })
  nftCollateralMint?: string

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', nullable: true })
  lenderNoteMint?: string

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', nullable: true })
  borrowerNoteMint?: string

  @Field(() => Int, { nullable: true })
  @Column('integer', { nullable: true })
  apy?: number | null

  @Field(() => Number, { nullable: true })
  @Column('bigint', { nullable: true })
  start?: number | null

  @Field(() => Number, { nullable: true })
  @Column('bigint', { nullable: true })
  totalOwedLamports?: number | null

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Field(() => Date, { nullable: true })
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date
}
