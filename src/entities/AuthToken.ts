import { Field, ID, ObjectType } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@ObjectType()
@Entity()
export class AuthToken extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => String, { nullable: false })
  @Column({ nullable: false })
  token: string

  @Field(() => Date)
  @CreateDateColumn()
  generatedAt: Date
}
