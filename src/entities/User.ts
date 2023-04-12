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

    @Column({ nullable: false })
    password: string;

    @Column({ nullable: true })
    lastLoginTimestamp: Date;

    @Field(() => String, { nullable: true })
    accessToken: string;

    @Column({ type: 'int', default: 0 })
    tokenVersion: number

    static async incrementTokenVersion(id: number) {
        await this.createQueryBuilder()
            .update()
            .set({ tokenVersion: () => `"tokenVersion" + ${1}` })
            .where('id = :id', { id })
            .execute();
    }
}
