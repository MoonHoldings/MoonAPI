import { Field, ID, ObjectType } from "type-graphql"
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm"
import { isAfter } from 'date-fns';

@ObjectType()
@Entity()
export class EmailToken extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id!: number

    @Field(() => String, { nullable: false })
    @Column({ nullable: false })
    email: string;

    @Field(() => String, { nullable: false })
    @Column({ nullable: false })
    token: string;

    @Field(() => Date)
    @CreateDateColumn()
    generatedAt: Date;

    @Field(() => Date)
    @CreateDateColumn()
    expireAt: Date;

    isExpired(): boolean {
        return isAfter(new Date(), this.expireAt);
    }
}
