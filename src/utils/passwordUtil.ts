

const bcrypt = require("bcrypt")
import { Service } from 'typedi';

@Service()
export class PasswordUtil {
    async generatePassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }
}
