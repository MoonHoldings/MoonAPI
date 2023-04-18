import { Field, ID, ObjectType, Int } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from 'typeorm'
import { OrderBook } from './OrderBook'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

@ObjectType()
@Entity()
export class NftList extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => String)
  @Column('text', { unique: true })
  pubKey!: string

  @Field(() => Int)
  @Column('integer')
  version!: number

  @Field(() => String)
  @Column('text')
  nftMint!: string

  @Field(() => String)
  @Column('text')
  collectionName!: string

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  collectionImage?: string

  @Field(() => Number, { nullable: true })
  @Column('bigint', { nullable: true })
  floorPrice!: number

  @Column('simple-array', { nullable: true })
  mints!: string[]

  @Field(() => Number, { nullable: true })
  floorPriceSol(): number | null {
    return this.floorPrice ? this.floorPrice / LAMPORTS_PER_SOL : null
  }

  @Field(() => OrderBook, { nullable: true })
  @OneToOne(() => OrderBook, (orderBook) => orderBook.nftList, { cascade: true })
  orderBook: Relation<OrderBook>

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
