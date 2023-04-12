"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = exports.createRefreshToken = exports.createAccessToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const jsonwebtoken_2 = require("jsonwebtoken");
const createAccessToken = (user) => {
    return (0, jsonwebtoken_1.sign)({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "7d" });
};
exports.createAccessToken = createAccessToken;
const createRefreshToken = (user) => {
    return (0, jsonwebtoken_1.sign)({ userId: user.id, tokenVersion: user.tokenVersion }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};
exports.createRefreshToken = createRefreshToken;
const isAuth = ({ context }, next) => {
    const authorization = context.req.headers['authorization'];
    if (!authorization) {
        throw new Error("Not Authenticated");
    }
    try {
        const token = authorization.split(' ')[1];
        const payload = (0, jsonwebtoken_2.verify)(token, process.env.ACCESS_TOKEN_SECRET);
        context.payload = payload;
    }
    catch (err) {
        console.log(err);
        throw new Error("Not Authenticated");
    }
    return next();
};
exports.isAuth = isAuth;
//# sourceMappingURL=auth.js.map