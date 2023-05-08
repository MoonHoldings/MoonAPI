import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { Portfolio } from "./Portfolio";

@ObjectType()
@Entity()
export class Coin extends BaseEntity {

    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id!: number

    @Field(() => Portfolio)
    @ManyToOne(() => Portfolio, (portfolio) => portfolio.coins)
    portfolio!: Relation<Portfolio>

    @Field(() => String)
    @Column('text', { nullable: true })
    walletAddress: String

    @Field(() => String)
    @Column('text', { nullable: true })
    walletName: String

    @Field(() => String)
    @Column('text')
    symbol: string

    @Field(() => String)
    @Column('text')
    name: String

    @Field(() => Number, { nullable: true })
    @Column('bigint', { nullable: true })
    holdings: number

    @Field()
    price: String
}
