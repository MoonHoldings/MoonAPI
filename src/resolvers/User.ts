import { Context } from 'apollo-server-core'
import { User } from '../entities'
import { SigninType } from '../enums'
import { UserService } from '../services'
import { Arg, Ctx, Int, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql'
import { isAuth } from '../utils'
import Container from 'typedi'
import * as utils from '../utils'



@Resolver()
export class UserResolver {
    private userService = Container.get(UserService)

    @Mutation(() => User)
    async register(@Arg('email') email: string, @Arg('password') password: string): Promise<User> {
        return await this.userService.register(email, password)
    }

    @Mutation(() => User)
    async login(@Arg('email') email: string, @Arg('password') password: string, @Ctx() ctx: Context<any>): Promise<User> {
        return await this.userService.login(email, password, ctx)
    }

    //like a logout function
    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async revokeRefreshTokensForUser(@Arg('userId', () => Int) userId: number) {
        await this.userService.incrementRefreshVersion(userId)
        return true
    }

    @Query(() => String)
    async generateDiscordUrl() {
        return utils.generateDiscordUrl()
    }

    @Query(() => Boolean)
    async getPasswordResetUrl(@Arg('email') email: string,): Promise<boolean> {
        return await this.userService.getPasswordResetEmail(email);
    }

    @Query(() => Boolean)
    @UseMiddleware(isAuth)
    async updatePassword(@Arg('password') email: string, @Ctx() ctx: Context<any>): Promise<boolean> {
        const token = ctx.req.cookies.jid

        return await this.userService.updatePassword(email, token);
    }


    // @Query(() => String)
    // async bye(@Ctx() { }: Session) {
    //     const DiscordOauth2 = require("discord-oauth2");
    //     const oauth = new DiscordOauth2({
    //         clientId: '1096313631894933544',
    //         clientSecret: 'fnOfTnPPDypUl7fyDt6wVjFdPyuZLEwP',
    //         redirectUri: 'http://localhost:80/auth/discord',
    //     });

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
