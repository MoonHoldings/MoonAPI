import { Field, ID, ObjectType } from "type-graphql"
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@ObjectType()
@Entity()
export class User extends BaseEntity {

    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id!: number

    @Field(() => String, { nullable: false })
    @Column({ nullable: false })
    email: string;

    @Field(() => String, { nullable: false })
    @Column({ nullable: false })
    password: string;

    @Field(() => Boolean, { defaultValue: false })
    @Column({ type: 'boolean', default: 'false' })
    isVerified: boolean;

    @Column({ nullable: true })
    lastLoginTimestamp: Date;
}
