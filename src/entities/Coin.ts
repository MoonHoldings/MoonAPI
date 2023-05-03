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
    @Column('text')
    walletAddress: String

    @Field(() => String)
    @Column('text')
    symbol: String

    @Field(() => String)
    @Column('text')
    name: String

    @Field()
    price: String
}
