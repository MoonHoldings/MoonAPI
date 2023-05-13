import { Field, ID, ObjectType } from 'type-graphql'
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm'
import { Nft } from '.'

@ObjectType()
@Entity()
export class NftCollection extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => String, { nullable: true })
  @Column('varchar', { nullable: true })
  mint: string

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
}
