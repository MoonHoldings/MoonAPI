import { Field, ID, ObjectType } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from 'typeorm'
import { UserWallet } from '.'
import { WalletDataType } from '../types'

@ObjectType()
@Entity()
export class WalletData extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => String, { nullable: false })
  @Column({ nullable: true })
  type: WalletDataType

  @Field(() => String, { nullable: false })
  @Column({ nullable: false })
  assetId: string

  @Field(() => Number)
  @Column('numeric')
  total!: number

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Field(() => UserWallet, { nullable: true })
  @ManyToOne(() => UserWallet, (wallet) => wallet.data, { nullable: true })
  wallet?: Relation<UserWallet> | null
}
