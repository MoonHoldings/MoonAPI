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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
exports.UserService = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const entities_1 = require("../entities");
const typedi_1 = __importStar(require("typedi"));
const check_password_strength_1 = require("check-password-strength");
const enums_1 = require("../enums");
const EmailToken_1 = require("./EmailToken");
const constants_1 = require("../constants");
const mail_1 = __importDefault(require("@sendgrid/mail"));
const utils = __importStar(require("../utils"));
let UserService = class UserService {
    constructor() {
        this.emailTokenService = typedi_1.default.get(EmailToken_1.EmailTokenService);
        mail_1.default.setApiKey(`${constants_1.SENDGRID_KEY}`);
    }
    register(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield this.getUserByEmail(email);
            if (user) {
                throw new apollo_server_express_1.UserInputError('User exists');
            }
            let hashedPassword;
            if ((0, check_password_strength_1.passwordStrength)(password).id != 0 || (0, check_password_strength_1.passwordStrength)(password).id != 1)
                hashedPassword = yield utils.generatePassword(password);
            else {
                throw new apollo_server_express_1.UserInputError('Password is too weak');
            }
            const hasSent = yield this.sendConfirmationEmail(email);
            if (hasSent) {
                return yield this.createUser(email, enums_1.SignupType.EMAIL, hashedPassword);
            }
            else {
                throw new apollo_server_express_1.UserInputError('Signup is unavailable at the moment. Please try again later.');
            }
        });
    }
    login(email, password, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield this.getUserByEmail(email);
            if (!user) {
                throw new apollo_server_express_1.UserInputError('User does not exists');
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
            entities_1.User.save(user);
            ctx.res.cookie('jid', utils.createRefreshToken(user), { httpOnly: true });
            user.accessToken = utils.createAccessToken(user);
            return user;
        });
    }
    getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield entities_1.User.findOne({ where: { email } });
            ;
        });
    }
    incrementRefreshVersion(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                entities_1.User.incrementTokenVersion(id);
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    sendConfirmationEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const randomToken = yield this.emailTokenService.generateUserConfirmationToken(email);
            const username = utils.removeEmailAddressesFromString(email);
            const message = utils.generateEmailHTML(username, utils.encryptToken(randomToken));
            const msg = {
                to: email,
                from: `${constants_1.SG_SENDER}`,
                subject: "MoonHoldings Email Confirmation",
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
    }
    discordAuth(email, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.getUserByEmail(email);
            let token = null;
            if (!user) {
                const hasSent = yield this.sendConfirmationEmail(email);
                if (hasSent) {
                    yield this.createUser(email, enums_1.SignupType.DISCORD);
                    token = true;
                }
                else {
                    throw new Error('There is an issue with our email servers. Please try again later.');
                }
            }
            else {
                res.cookie('jid', utils.createRefreshToken(user), { httpOnly: true });
            }
            return token;
        });
    }
    createUser(email, signupType, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const newUser = new entities_1.User();
            const generatedUsername = utils.removeEmailAddressesFromString(email);
            newUser.email = email;
            newUser.username = generatedUsername;
            newUser.signupType = signupType;
            if (password) {
                newUser.password = password;
            }
            return entities_1.User.save(newUser);
        });
    }
};
UserService = __decorate([
    (0, typedi_1.Service)(),
    __metadata("design:paramtypes", [])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=User.js.map