import { hash, compare } from 'bcrypt';

export const comparePassword = async (password: string, hashedPassword: string) => {
    return await compare(password, hashedPassword);
}

export const generatePassword = async (password: string) => {
    return await hash(password, 10);
}
