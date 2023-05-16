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

  @Field(() => Boolean, { defaultValue: false })
  @Column({ type: 'boolean', default: false })
  verified: boolean = false

  @Field()
  price: String
}
