import { Field, ID, ObjectType } from 'type-graphql'
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@ObjectType()
@Entity()
export class Coin extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => Number, { nullable: true })
  @Column({ nullable: true })
  walletId: number

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  walletAddress: string

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  symbol: string

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  walletName: string

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  name: String

  @Field(() => Number, { nullable: true })
  @Column({ nullable: true, type: 'numeric', precision: 30, scale: 10 })
  holdings: number

  @Field({ nullable: true })
  price: String

  @Field({ nullable: true })
  key: String

  @Field({ nullable: true })
  isConnected: boolean = false

  @Field(() => Boolean, { defaultValue: false })
  verified: boolean = false
}
