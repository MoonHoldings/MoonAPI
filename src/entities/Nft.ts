import { Field, ID, ObjectType } from 'type-graphql'
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm'
import { User, NftCollection } from '.'

@ObjectType()
@Entity()
export class Nft extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => String, { nullable: true })
  @Column('varchar', { nullable: true })
  mint: string

  @Field(() => String)
  @Column('json')
  attributes: string

  @Field(() => String)
  @Column('json')
  attributesArray: string

  @Field(() => String, { nullable: true })
  @Column('varchar', { nullable: true })
  owner: string

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

  @Field(() => Boolean, { defaultValue: false })
  @Column({ type: 'boolean', default: false })
  verified: boolean = false

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.nfts)
  user!: Relation<User>

  @Field(() => NftCollection, { nullable: true })
  @ManyToOne(() => NftCollection, (collection) => collection.nfts, { nullable: true })
  collection?: Relation<NftCollection>
}
