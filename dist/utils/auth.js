"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDiscordUrl = exports.isAuth = exports.createRefreshToken = exports.createAccessToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const jsonwebtoken_2 = require("jsonwebtoken");
const constants_1 = require("../constants");
const discord_1 = __importDefault(require("./discord"));
const crypto = require('crypto');
const createAccessToken = (user) => {
    return (0, jsonwebtoken_1.sign)({ userId: user.id }, `${constants_1.ACCESS_TOKEN_SECRET}`, { expiresIn: "1d" });
};
exports.createAccessToken = createAccessToken;
const createRefreshToken = (user) => {
    return (0, jsonwebtoken_1.sign)({ userId: user.id, tokenVersion: user.tokenVersion }, `${constants_1.REFRESH_TOKEN_SECRET}`, { expiresIn: "7d" });
};
exports.createRefreshToken = createRefreshToken;
const isAuth = ({ context }, next) => {
    const authorization = context.req.headers['authorization'];
    if (!authorization) {
        throw new Error("Not Authenticated");
    }
    try {
        const token = authorization.split(' ')[1];
        const payload = (0, jsonwebtoken_2.verify)(token, `${constants_1.ACCESS_TOKEN_SECRET}`);
        context.payload = payload;
    }
    catch (err) {
        console.log(err);
        throw new Error("Not Authenticated");
    }
    return next();
};
exports.isAuth = isAuth;
const generateDiscordUrl = () => {
    const url = discord_1.default.generateAuthUrl({
        scope: ["identify", "email"],
        state: crypto.randomBytes(16).toString("hex"),
    });
    return url;
};
exports.generateDiscordUrl = generateDiscordUrl;
//# sourceMappingURL=auth.js.map