import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { User } from "./User";
import { Coin } from "./Coin";

@ObjectType()
@Entity()
export class Portfolio extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id!: number

    @OneToOne(() => User, (user) => user.portfolio)
    @Field(() => User, { nullable: true })
    user: Relation<User>

    @OneToMany(() => Coin, (coin) => coin.portfolio, {
        cascade: true,
    })
    @Field(() => [Coin], { nullable: true })
    coins: Relation<Coin>[]
}
