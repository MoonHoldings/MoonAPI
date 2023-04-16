"use strict";
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
const jsonwebtoken_1 = require("jsonwebtoken");
const auth_1 = require("./auth");
const express_1 = __importDefault(require("express"));
const services_1 = require("../services");
const typedi_1 = require("typedi");
const entities_1 = require("../entities");
const discord_1 = __importDefault(require("./discord"));
const router = express_1.default.Router();
const emailTokenService = typedi_1.Container.get(services_1.EmailTokenService);
const userService = typedi_1.Container.get(services_1.UserService);
router.post('/refresh_token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.jid;
    if (!token) {
        return res.send({ ok: false, accessToken: '' });
    }
    let payload = null;
    try {
        payload = (0, jsonwebtoken_1.verify)(token, process.env.REFRESH_TOKEN_SECRET);
    }
    catch (err) {
        return res.send({ ok: false, accessToken: '' });
    }
    const user = yield entities_1.User.findOne({ where: { id: payload.userId } });
    if (!user) {
        return res.send({ ok: false, accessToken: '' });
    }
    if (user.tokenVersion != payload.tokenVersion) {
        return res.send({ ok: false, accessToken: '' });
    }
    return res.send({ ok: true, accessToken: (0, auth_1.createAccessToken)(user) });
}));
router.get('/verify_email/:token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const success = yield emailTokenService.validateUserToken(req.params.token);
    if (success) {
        return res.status(200).redirect('http://localhost/graphql');
    }
    else {
    }
}));
router.get('/auth/discord', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = req.query.code;
    try {
        const accessToken = yield discord_1.default.tokenRequest({
            code,
            scope: ['identify', 'email'],
            grantType: 'authorization_code',
        });
        const userInfo = yield discord_1.default.getUser(accessToken.access_token);
        if (userInfo.email) {
            const accessToken = yield userService.discordAuth(userInfo.email, res);
            if (accessToken) {
                res.status(200).redirect(`/dashboard`);
            }
            else {
                res.status(200).redirect(`/login}`);
            }
        }
        else {
            res.status(200).json({ error: 'Verify if discord email is confirmed' });
        }
    }
    catch (error) {
        console.error(error.response);
        res.status(200).json({ error: 'Discord might have maintenance' });
    }
}));
exports.default = router;
//# sourceMappingURL=restapi.js.map