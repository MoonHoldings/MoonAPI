import { Field, ID, ObjectType } from "type-graphql"
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@ObjectType()
@Entity()
export class Username extends BaseEntity {

    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id!: number

    @Field(() => String, { nullable: false })
    @Column({ nullable: true })
    nouns: string

    @Field(() => String, { nullable: false })
    @Column({ nullable: true })
    adjective: string

    @Field(() => String, { nullable: false })
    @Column({ nullable: true })
    adverbs: string
}