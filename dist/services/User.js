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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const entities_1 = require("../entities");
const typedi_1 = require("typedi");
const check_password_strength_1 = require("check-password-strength");
const utils = __importStar(require("../utils"));
let UserService = class UserService {
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
            user = new entities_1.User();
            user.email = email;
            user.password = hashedPassword;
            return yield entities_1.User.save(user);
        });
    }
    login(email, password, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield this.getUserByEmail(email);
            if (!user) {
                throw new apollo_server_express_1.UserInputError('User does not exists');
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
};
UserService = __decorate([
    (0, typedi_1.Service)()
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=User.js.map