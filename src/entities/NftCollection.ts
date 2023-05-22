import { Field, ID, ObjectType } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from 'typeorm'
import { Nft } from '.'

@ObjectType()
@Entity()
export class NftCollection extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => String, { nullable: true })
  @Column('varchar', { nullable: true, unique: true })
  mint: string

  @Field(() => String, { nullable: true })
  @Column('varchar', { nullable: true })
  nftMint: string

  @Field(() => String, { nullable: true })
  @Column('varchar', { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  image?: String

  @Field(() => Number, { nullable: true })
  @Column('bigint', { nullable: true })
  floorPrice?: number | null

  @OneToMany(() => Nft, (nft) => nft.collection, {
    cascade: true,
  })
  @Field(() => [Nft], { nullable: true })
  nfts: Relation<Nft>[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
