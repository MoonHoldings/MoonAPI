import { Field, ID, ObjectType } from 'type-graphql'
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm'
import { User } from './User'

@ObjectType()
@Entity()
export class Coin extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.coins)
  user!: Relation<User>

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  walletAddress: string

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  walletName: String

  @Field(() => String)
  @Column('text', { nullable: true })
  symbol: string

  @Field(() => String)
  @Column('text', { nullable: true })
  name: String

  @Field(() => Number, { nullable: true })
  @Column({ nullable: true, type: 'numeric', precision: 30, scale: 10 })
  holdings: number

  @Field(() => Boolean, { defaultValue: false })
  @Column({ type: 'boolean', default: false })
  verified: boolean = false

  @Field()
  price: String
}
