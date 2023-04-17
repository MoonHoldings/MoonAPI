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
const jsonwebtoken_1 = require("jsonwebtoken");
const auth_1 = require("./auth");
const express_1 = __importDefault(require("express"));
const emailTokenService = __importStar(require("../services/EmailToken"));
const userService = __importStar(require("../services/User"));
const entities_1 = require("../entities");
const utils = __importStar(require("../utils"));
const discord_1 = __importDefault(require("./discord"));
const cache_1 = require("./cache");
const router = express_1.default.Router();
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
    return res.send({ ok: true, accessToken: (0, auth_1.createAccessToken)(user, '1d') });
}));
router.get('/verify_email/:token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('hi');
    const success = yield emailTokenService.validateUserToken(req.params.token);
    console.log(success);
    if (success) {
        return res.status(200).redirect('http://localhost/graphql');
    }
    else {
    }
}));
router.get('/reset_password_callback/:token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const success = yield emailTokenService.validateUserToken(req.params.token);
    if (success) {
        res.cookie('jid', utils.createAccessToken(success, '5m'), { httpOnly: true });
        return res.status(200).redirect('http://localhost/graphql');
    }
    else {
    }
}));
router.get('/auth/discord', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = req.query.code;
    const state = req.query.state;
    const value = yield cache_1.memoryCache;
    const isValidState = yield value.get(state);
    if (!isValidState) {
        return res.status(200).json({ error: 'Authorization link has expired' });
    }
    try {
        const accessToken = yield discord_1.default.tokenRequest({
            code,
            scope: ['identify', 'email'],
            grantType: 'authorization_code',
        });
        const userInfo = yield discord_1.default.getUser(accessToken.access_token);
        if (userInfo.email) {
            const user = yield userService.discordAuth(userInfo.email);
            if (!(user === null || user === void 0 ? void 0 : user.isVerified)) {
                return res.status(200).json({ error: 'Your email has been linked to your discord profile. Please verify your email to login.' });
            }
            if (user) {
                return res.send({ ok: true, accessToken: (0, auth_1.createAccessToken)(user, '1d') });
            }
            else {
                return res.status(200).redirect(`/login`);
            }
        }
        else {
            return res.status(200).json({ error: 'Verify if discord email is confirmed' });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(200).json({ error: 'Discord might have maintenance' });
    }
}));
exports.default = router;
//# sourceMappingURL=restapi.js.map