import { Field, ID, Int, ObjectType } from 'type-graphql'
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm'
import { SignInType } from './SignInType'
import { addMinutes, isAfter } from 'date-fns'
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

  @Field(() => Boolean, { defaultValue: false })
  @Column({ type: 'boolean', default: 'false' })
  isLocked: boolean

  @Column({ nullable: true })
  password: string

  @Column({ nullable: true })
  lastLoginTimestamp: Date

  @Column({ nullable: true })
  verifiedAt: Date

  @Column({ type: 'int', default: 0 })
  tokenVersion: number

  @Column('integer', { default: 0 })
  attempts: number

  @Field(() => String, { nullable: true })
  accessToken: string

  @OneToMany(() => SignInType, (signInType) => signInType.user, {
    cascade: true,
  })
  @Field(() => [SignInType], { nullable: true })
  signInTypes: Relation<SignInType>[]

  @Column({ nullable: true })
  failedLoginAt: Date

  static async incrementTokenVersion(id: number) {
    await this.createQueryBuilder()
      .update()
      .set({ tokenVersion: () => `"tokenVersion" + ${1}` })
      .where('id = :id', { id })
      .execute()
  }

  async incrementFailedAttempts() {
    const originalDate = new Date()
    const lockoutThresholdTime = addMinutes(this.failedLoginAt, 5)

    if (isAfter(lockoutThresholdTime, originalDate)) {
      // User has exceeded the maximum number of login attempts
      if (this.attempts <= 3) {
        // Increment the attempts and set the failed login time
        await User.createQueryBuilder('user')
          .update()
          .set({ attempts: () => `"attempts" + ${1}`, failedLoginAt: new Date() })
          .where('id = :id', { id: this.id })
          .execute()
      } else {
        // Lock the user account
        await User.createQueryBuilder('user')
          .update()
          .set({ isLocked: true, failedLoginAt: new Date() })
          .where('id = :id', { id: this.id })
          .execute()
      }
    } else {
      // Reset the attempts and failed login time
      await User.createQueryBuilder('user')
        .update()
        .set({ attempts: 1, failedLoginAt: new Date(), isLocked: this.isLocked && false })
        .where('id = :id', { id: this.id })
        .execute()
    }
  }

  async checkToUnlock() {
    const originalDate = new Date()
    const lockoutThresholdTime = addMinutes(this.failedLoginAt, 5)

    if (isAfter(lockoutThresholdTime, originalDate)) {
      return false;
    } else {
      // Reset the attempts and failed login time
      await User.createQueryBuilder('user')
        .update()
        .set({ attempts: 1, failedLoginAt: new Date(), isLocked: this.isLocked && false })
        .where('id = :id', { id: this.id })
        .execute()

      return true;
    }
  }
}
