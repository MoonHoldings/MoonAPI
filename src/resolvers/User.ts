import { Context } from "apollo-server-core";
import { User } from "../entities"
import { UserService } from "../services";
import { Arg, Ctx, Int, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"
import { isAuth } from "../utils";
import Container from 'typedi';
import * as utils from '../utils';


@Resolver()
export class UserResolver {

    private userService = Container.get(UserService);

    @Mutation(() => User)
    async register(@Arg('email') email: string, @Arg('password') password: string): Promise<User> {
        return await this.userService.register(email, password);
    }

    @Mutation(() => User)
    async login(@Arg('email') email: string, @Arg('password') password: string, @Ctx() ctx: Context<any>): Promise<User> {
        return await this.userService.login(email, password, ctx);
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

    //like a logout function
    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async revokeRefreshTokensForUser(@Arg('userId', () => Int) userId: number) {
        await this.userService.incrementRefreshVersion(userId);
        return true;
    }

    @Query(() => String)
    async generateDiscordUrl() {
        return utils.generateDiscordUrl();
    }

    //TODO: In case to use in future
    // @Query(() => User)
    // async refreshToken(@Ctx() ctx: Session): Promise<String> {
    //     return await this.userService.refreshAccessToken(ctx);
    // }
}
