import { Field, ID, ObjectType } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from 'typeorm'
import { NftCollection } from '.'

@ObjectType()
@Entity()
export class Nft extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => String, { nullable: true })
  @Column('varchar', { nullable: true, unique: true })
  mint: string

  @Field(() => String)
  @Column('text')
  attributes: string

  @Field(() => String)
  @Column('text')
  attributesArray: string

  @Field(() => String, { nullable: true })
  @Column('varchar', { nullable: true })
  owner: string | null

  @Field(() => String, { nullable: true })
  @Column('varchar', { nullable: true })
  name: string

  @Field(() => String)
  @Column('varchar')
  symbol: string

  @Field(() => String)
  @Column('text')
  image: String

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  description?: String

  @Field(() => NftCollection, { nullable: true })
  @ManyToOne(() => NftCollection, (collection) => collection.nfts, { nullable: true })
  collection?: Relation<NftCollection> | null

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
