import { Field, ID, ObjectType } from 'type-graphql'
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm'
import { SigninType } from './SigninType'

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => String, { nullable: false })
  @Column({ nullable: false })
  email: string

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  username: string

  @Field(() => Boolean, { defaultValue: false })
  @Column({ type: 'boolean', default: 'false' })
  isVerified: boolean

  @Field(() => String, { nullable: false })
  @Column({ type: 'varchar', nullable: true })
  signupType: string

  @Column({ nullable: true })
  password: string

  @Column({ nullable: true })
  lastLoginTimestamp: Date

  @Column({ nullable: true })
  verifiedAt: Date

  @Column({ type: 'int', default: 0 })
  tokenVersion: number

  @Field(() => String, { nullable: true })
  accessToken: string

  @OneToMany(() => SigninType, (signInType) => signInType.user, {
    cascade: true,
  })
  @Field(() => String, { nullable: true })
  signInTypes: Relation<SigninType>[]

  static async incrementTokenVersion(id: number) {
    await this.createQueryBuilder()
      .update()
      .set({ tokenVersion: () => `"tokenVersion" + ${1}` })
      .where('id = :id', { id })
      .execute()
  }
}
