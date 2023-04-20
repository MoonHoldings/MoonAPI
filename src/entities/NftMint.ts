import { Field, ID, ObjectType } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm'
import { NftList } from '.'

@ObjectType()
@Entity()
export class NftMint extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => Number, { nullable: true })
  @Column('integer', { nullable: true })
  nftListIndex!: number

  @Field(() => String)
  @Column({ nullable: false })
  mint: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @Field(() => NftList)
  @ManyToOne(() => NftList, (nftList) => nftList.mints)
  nftList!: Relation<NftList>
}
