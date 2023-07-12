import { Field, ID, ObjectType } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from 'typeorm'
import { User } from '.'

@ObjectType()
@Entity()
export class UserDashboard extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => String, { nullable: false })
  @Column({ nullable: true })
  type: string

  @Field(() => Number)
  @Column('numeric')
  total!: number

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.dashboards, { nullable: true })
  user?: Relation<User> | null
}
