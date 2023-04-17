import { Field, ID, ObjectType } from 'type-graphql'
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@ObjectType()
@Entity()
export class SigninType extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id!: number

    @Field(() => String, { nullable: false })
    @Column({ nullable: false })
    email: string

    @Field(() => String, { nullable: false })
    @Column({ nullable: false })
    signinType: string
}
