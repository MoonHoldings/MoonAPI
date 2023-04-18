import { Context } from 'apollo-server-core'
import { User } from '../entities'
import * as userService from '../services/User'
import { Arg, Ctx, Int, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql'
import { isAuth } from '../utils'
import * as utils from '../utils'

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(@Arg('email') email: string, @Arg('password') password: string): Promise<User> {
    return await userService.register(email, password)
  }

  @Mutation(() => User)
  async login(@Arg('email') email: string, @Arg('password') password: string, @Ctx() ctx: Context<any>): Promise<User> {
    return await userService.login(email, password, ctx)
  }

  //like a logout function
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async revokeRefreshTokensForUser(@Arg('userId', () => Int) userId: number) {
    await userService.incrementRefreshVersion(userId)
    return true
  }

  @Query(() => String)
  async generateDiscordUrl() {
    return utils.generateDiscordUrl()
  }

  @Query(() => Boolean)
  async getPasswordResetUrl(@Arg('email') email: string): Promise<boolean> {
    return await userService.getPasswordResetEmail(email)
  }

  @Query(() => Boolean)
  async updatePassword(@Arg('password') email: string, @Ctx() ctx: Context<any>): Promise<boolean> {
    const token = ctx.req.cookies.jid
    return await userService.updatePassword(email, token)
  }

  //     const url = oauth.generateAuthUrl({
  //         scope: ["identify", "email"],
  //         state: crypto.randomBytes(16).toString("hex"),
  //     });
  //     return url;
  // }
  //TODO: In case to use in future
  // @Query(() => User)
  // async refreshToken(@Ctx() ctx: Session): Promise<String> {
  //     return await this.userService.refreshAccessToken(ctx);
  // }
}
