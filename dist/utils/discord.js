"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_oauth2_1 = __importDefault(require("discord-oauth2"));
const constants_1 = require("../constants");
const oauth = new discord_oauth2_1.default({
    clientId: constants_1.DISCORD_CLIENT_ID,
    clientSecret: constants_1.DISCORD_CLIENT_SECRET,
    redirectUri: `${constants_1.SERVER_URL}:80/auth/discord`,
});
exports.default = oauth;
//# sourceMappingURL=discord.js.map