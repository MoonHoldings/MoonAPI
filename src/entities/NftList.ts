import { Field, ID, ObjectType, Int } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from 'typeorm'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { OrderBook, NftMint } from '.'

@ObjectType()
@Entity()
export class NftList extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => String)
  @Column('varchar', { unique: true })
  pubKey!: string

  @Field(() => Int)
  @Column('integer')
  version!: number

  @Field(() => String)
  @Column('varchar')
  nftMint!: string

  @Field(() => String)
  @Column('varchar')
  collectionName!: string

  @Field(() => String, { nullable: true })
  @Column('varchar', { nullable: true })
  collectionImage?: string

  @Field(() => Number, { nullable: true })
  @Column('bigint', { nullable: true })
  floorPrice!: number

  @Field(() => [NftMint], { nullable: true })
  @OneToMany(() => NftMint, (nftMint) => nftMint.nftList, {
    cascade: true,
  })
  mints!: Relation<NftMint>[]

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
