import { Field, ID, ObjectType } from 'type-graphql'
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@ObjectType()
@Entity()
export class FXRate extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => String, { nullable: false })
  @Column({ nullable: false })
  assetIdBase: string

  @Field(() => String, { nullable: false })
  @Column({ nullable: false })
  assetIdQuote: string

  @Field(() => String, { nullable: false })
  @Column({ nullable: false })
  pair: string

  @Field(() => Number)
  @Column('numeric')
  rate!: number

  @Field(() => Date)
  @Column({ nullable: false })
  time: Date
}
