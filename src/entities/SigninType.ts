import { Field, ID, ObjectType } from 'type-graphql'
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm'
import { User } from './User'

@ObjectType()
@Entity()
export class SigninType extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id!: number


    @Field(() => User)
    @ManyToOne(() => User, (user) => user.signInTypes)
    user!: Relation<User>

    @Field(() => String, { nullable: false })
    @Column({ nullable: false })
    signinType: string
}
