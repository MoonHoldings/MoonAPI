import { Field, ID, ObjectType } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from 'typeorm'
import { User } from '.'

@ObjectType()
@Entity()
export class UserWallet extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => String, { nullable: false })
  @Column({ nullable: true })
  address: string

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  walletName: string

  @Field(() => String, { nullable: false })
  @Column({ nullable: true })
  walletType: string

  @Field(() => Boolean, { defaultValue: false })
  @Column({ type: 'boolean', default: false })
  verified: boolean = false

  @Field(() => Boolean, { defaultValue: false })
  @Column({ type: 'boolean', default: false })
  hidden: boolean = false

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.wallets, { nullable: true })
  user?: Relation<User> | null
}
