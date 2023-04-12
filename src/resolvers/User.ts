import { User } from "../entities"
import { UserService } from "../services";
import { Arg, Mutation, Resolver } from "type-graphql"
import Container from 'typedi';

@Resolver()
export class UserResolver {

    private userService = Container.get(UserService);

    @Mutation(() => User)
    async register(@Arg('email') email: string, @Arg('password') password: string): Promise<User> {
        return await this.userService.register(email, password);
    }

    @Mutation(() => User)
    async login(@Arg('email') email: string, @Arg('password') password: string): Promise<User> {
        return await User.findOneByOrFail({ email });
    }
}
