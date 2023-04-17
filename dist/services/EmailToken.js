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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserToken = exports.generateUserConfirmationToken = void 0;
const string_1 = require("../utils/string");
const entities_1 = require("../entities");
const constants_1 = require("../constants");
const utils = __importStar(require("../utils"));
const date_fns_1 = require("date-fns");
const enums_1 = require("../enums");
const generateUserConfirmationToken = (email, type) => __awaiter(void 0, void 0, void 0, function* () {
    const token = (0, string_1.generateRandomString)(32);
    const emailToken = yield entities_1.EmailToken.findOne({ where: { email } });
    const now = new Date();
    if (emailToken) {
        if (emailToken.isExpired()) {
            yield entities_1.EmailToken.save(Object.assign(emailToken, {
                token: token,
                generatedAt: now,
                expireAt: (0, date_fns_1.add)(now, { days: constants_1.EMAIL_EXPIRY_IN_DAYS }),
                emailTokenType: type
            }));
        }
        else {
            return emailToken.token;
        }
    }
    else {
        yield entities_1.EmailToken.save({
            email: email,
            token: token,
            generatedAt: now,
            expireAt: (0, date_fns_1.add)(now, { days: constants_1.EMAIL_EXPIRY_IN_DAYS }),
            emailTokenType: type
        });
    }
    return token;
});
exports.generateUserConfirmationToken = generateUserConfirmationToken;
const validateUserToken = (hashedToked) => __awaiter(void 0, void 0, void 0, function* () {
    const token = utils.decryptToken(utils.removedKey(hashedToked));
    const emailToken = yield entities_1.EmailToken.findOne({ where: { token } });
    if (!emailToken) {
        return null;
    }
    if (emailToken.isExpired()) {
        return null;
    }
    const user = yield entities_1.User.findOne({ where: { email: emailToken.email } });
    if (!user) {
        return null;
    }
    if (emailToken.emailTokenType == enums_1.EmailTokenType.CONFIRMATION_EMAIL) {
        if (user.isVerified) {
            return null;
        }
        else {
            return yield entities_1.User.save(Object.assign(user, {
                isVerified: true,
                verifiedAt: new Date(),
            }));
        }
    }
    else {
        if (!user.isVerified) {
            return null;
        }
        return user;
    }
});
exports.validateUserToken = validateUserToken;
//# sourceMappingURL=EmailToken.js.map