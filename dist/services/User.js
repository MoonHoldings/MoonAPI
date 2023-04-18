"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRegisteredUser = exports.createUser = exports.discordAuth = exports.updatePassword = exports.getPasswordResetEmail = exports.sendConfirmationEmail = exports.incrementRefreshVersion = exports.getUserByEmail = exports.login = exports.register = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const entities_1 = require("../entities");
const check_password_strength_1 = require("check-password-strength");
const enums_1 = require("../enums");
const constants_1 = require("../constants");
const mail_1 = __importDefault(require("@sendgrid/mail"));
const utils = __importStar(require("../utils"));
const signInTypeService = __importStar(require("./SignInType"));
const emailTokenService = __importStar(require("./EmailToken"));
const jsonwebtoken_1 = require("jsonwebtoken");
mail_1.default.setApiKey(`${constants_1.SENDGRID_KEY}`);
const register = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield (0, exports.getUserByEmail)(email);
    let isRegUser = null;
    let hashedPassword = null;
    if ((0, check_password_strength_1.passwordStrength)(password).id != 0 && (0, check_password_strength_1.passwordStrength)(password).id != 1) {
        hashedPassword = yield utils.generatePassword(password);
    }
    else {
        throw new apollo_server_express_1.UserInputError('Password is too weak');
    }
    if (user) {
        isRegUser = yield (0, exports.isRegisteredUser)(user, enums_1.SignInType.EMAIL);
        if (!isRegUser) {
            yield signInTypeService.createSignInType(email, enums_1.SignInType.EMAIL);
            return yield entities_1.User.save(Object.assign(user, { hashedPassword }));
        }
        else {
            throw new Error('User is already existing');
        }
    }
    const hasSent = yield (0, exports.sendConfirmationEmail)(email);
    if (hasSent) {
        return yield (0, exports.createUser)(email, enums_1.SignInType.EMAIL, hashedPassword);
    }
    else {
        throw new apollo_server_express_1.UserInputError('Signup is unavailable at the moment. Please try again later.');
    }
});
exports.register = register;
const login = (email, password, ctx) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield (0, exports.getUserByEmail)(email);
    if (!user) {
        throw new apollo_server_express_1.UserInputError('User does not exist');
    }
    const hasEmailType = yield signInTypeService.hasSignInType(user.email, enums_1.SignInType.EMAIL);
    if (!hasEmailType) {
        throw new apollo_server_express_1.UserInputError('Email login not Available. Please signup to login.');
    }
    if (!user.isVerified) {
        throw new apollo_server_express_1.UserInputError('Please verify email');
    }
    let passwordMatched;
    passwordMatched = yield utils.comparePassword(password, user.password);
    if (!passwordMatched) {
        throw new apollo_server_express_1.UserInputError('Email or Password is incorrect.');
    }
    user.lastLoginTimestamp = new Date();
    yield entities_1.User.save(user);
    ctx.res.cookie('jid', utils.createRefreshToken(user), { httpOnly: true });
    user.accessToken = utils.createAccessToken(user, '1d');
    return user;
});
exports.login = login;
const getUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return yield entities_1.User.findOne({ where: { email } });
});
exports.getUserByEmail = getUserByEmail;
const incrementRefreshVersion = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield entities_1.User.incrementTokenVersion(id);
    }
    catch (err) {
        console.log(err);
    }
});
exports.incrementRefreshVersion = incrementRefreshVersion;
const sendConfirmationEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const randomToken = yield emailTokenService.generateUserConfirmationToken(email, enums_1.EmailTokenType.CONFIRMATION_EMAIL);
    const username = utils.removeEmailAddressesFromString(email);
    const message = utils.generateEmailHTML(username, utils.encryptToken(randomToken));
    const msg = {
        to: email,
        from: `${constants_1.SG_SENDER}`,
        subject: 'MoonHoldings Email Confirmation',
        html: message,
    };
    try {
        yield mail_1.default.send(msg);
    }
    catch (error) {
        console.error(error);
        return false;
    }
    return true;
});
exports.sendConfirmationEmail = sendConfirmationEmail;
const getPasswordResetEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield (0, exports.getUserByEmail)(email);
    if (!user) {
        throw new apollo_server_express_1.UserInputError('User does not exist');
    }
    else {
        const randomToken = yield emailTokenService.generateUserConfirmationToken(email, enums_1.EmailTokenType.RESET_PASSWORD);
        const username = utils.removeEmailAddressesFromString(email);
        const message = utils.generatePasswordReset(username, utils.encryptToken(randomToken));
        const msg = {
            to: email,
            from: `${constants_1.SG_SENDER}`,
            subject: 'MoonHoldings Password Reset',
            html: message,
        };
        try {
            yield mail_1.default.send(msg);
        }
        catch (error) {
            console.error(error);
            return false;
        }
        return true;
    }
});
exports.getPasswordResetEmail = getPasswordResetEmail;
const updatePassword = (password, token) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token) {
        throw new apollo_server_express_1.UserInputError('Not Authenticated');
    }
    let payload = null;
    try {
        payload = (0, jsonwebtoken_1.verify)(token, constants_1.ACCESS_TOKEN_SECRET);
    }
    catch (err) {
        throw new apollo_server_express_1.UserInputError('Invalid token');
    }
    const user = yield entities_1.User.findOne({ where: { id: payload.id } });
    if (!user) {
        throw new apollo_server_express_1.UserInputError('User Not found');
    }
    let hashedPassword;
    if ((0, check_password_strength_1.passwordStrength)(password).id == 0 || (0, check_password_strength_1.passwordStrength)(password).id == 1) {
        hashedPassword = yield utils.generatePassword(password);
    }
    else {
        throw new apollo_server_express_1.UserInputError('Password is too weak');
    }
    yield entities_1.User.save(Object.assign(user, { hashedPassword }));
    return true;
});
exports.updatePassword = updatePassword;
const discordAuth = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, exports.getUserByEmail)(email);
    let isRegUser = null;
    if (!user) {
        const hasSent = yield (0, exports.sendConfirmationEmail)(email);
        if (hasSent) {
            return yield (0, exports.createUser)(email, enums_1.SignInType.DISCORD);
        }
        else {
            throw new apollo_server_express_1.UserInputError('Signup is unavailable at the moment. Please try again later.');
        }
    }
    else {
        isRegUser = yield (0, exports.isRegisteredUser)(user, enums_1.SignInType.DISCORD);
    }
    if (!isRegUser) {
        yield signInTypeService.createSignInType(user.email, enums_1.SignInType.DISCORD);
    }
    user.lastLoginTimestamp = new Date();
    yield entities_1.User.save(user);
    return user;
});
exports.discordAuth = discordAuth;
const createUser = (email, signInType, password) => __awaiter(void 0, void 0, void 0, function* () {
    const newUser = new entities_1.User();
    const generatedUsername = utils.removeEmailAddressesFromString(email);
    newUser.email = email;
    newUser.username = generatedUsername;
    if (password) {
        newUser.password = password;
    }
    signInTypeService.createSignInType(email, signInType);
    return yield entities_1.User.save(newUser);
});
exports.createUser = createUser;
const isRegisteredUser = (user, signInType) => __awaiter(void 0, void 0, void 0, function* () {
    const hasSignInType = yield signInTypeService.hasSignInType(user.email, signInType);
    if (hasSignInType) {
        return true;
    }
    else {
        return false;
    }
});
exports.isRegisteredUser = isRegisteredUser;
//# sourceMappingURL=User.js.map