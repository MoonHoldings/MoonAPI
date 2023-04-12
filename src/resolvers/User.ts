import { Context } from "apollo-server-core";
import { User } from "../entities"
import { UserService } from "../services";
import { Arg, Ctx, Int, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"
import { isAuth } from "../utils";
import { Session } from "../utils/session";
import Container from 'typedi';

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
    @Query(() => String)
    @UseMiddleware(isAuth)
    bye(@Ctx() { payload }: Session) {
        return `your user id is:${payload?.userId}`
    }

    //like a logout function
    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async revokeRefreshTokensForUser(@Arg('userId', () => Int) userId: number) {
        await this.userService.incrementRefreshVersion(userId);
        return true;
    }
}
