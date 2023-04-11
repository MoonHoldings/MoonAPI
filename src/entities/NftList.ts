import { Field, ID, ObjectType } from "type-graphql"
import { BaseEntity, Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm"
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

  @Field(() => String)
  @Column("text")
  version!: string

  @Field(() => String)
  @Column("text")
  nftMint!: string

  @Field(() => String)
  @Column("text")
  collectionName!: string

  @Field(() => String, { nullable: true })
  @Column("text", { nullable: true })
  collectionImage?: string

  @OneToOne(() => OrderBook, (orderBook) => orderBook.nftList, { cascade: true })
  orderBook: OrderBook
}
