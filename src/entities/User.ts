import { SignupType } from "../enums";
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

    @Field(() => Boolean, { defaultValue: false })
    @Column({ type: 'boolean', default: 'false' })
    isVerified: boolean;

    @Field(() => SignupType, { nullable: false })
    @Column({ type: 'varchar', nullable: false, })
    signupType: string;

    @Column({ nullable: false })
    password: string;

    @Column({ nullable: true })
    lastLoginTimestamp: Date;

    @Column({ type: 'int', default: 0 })
    tokenVersion: number

    @Field(() => String, { nullable: true })
    accessToken: string;

    static async incrementTokenVersion(id: number) {
        await this.createQueryBuilder()
            .update()
            .set({ tokenVersion: () => `"tokenVersion" + ${1}` })
            .where('id = :id', { id })
            .execute();
    }
}