import { Field, ID, ObjectType, Int } from "type-graphql"
import { BaseEntity, Column, Entity, OneToOne, PrimaryGeneratedColumn, Relation } from "typeorm"
import { OrderBook } from "./OrderBook"

@ObjectType()
@Entity()
export class NftList extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => String)
  @Column("text", { unique: true })
  pubKey!: string

  @Field(() => Int)
  @Column("integer")
  version!: number

  @Field(() => String)
  @Column("text")
  nftMint!: string

  @Field(() => String)
  @Column("text")
  collectionName!: string

  @Field(() => String, { nullable: true })
  @Column("text", { nullable: true })
  collectionImage?: string

  @Field(() => Number, { nullable: true })
  @Column("bigint", { nullable: true })
  floorPrice!: number

  @Field(() => OrderBook, { nullable: true })
  @OneToOne(() => OrderBook, (orderBook) => orderBook.nftList, { cascade: true })
  orderBook: Relation<OrderBook>
}
