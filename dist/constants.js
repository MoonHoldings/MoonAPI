"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AXIOS_CONFIG_HELLO_MOON_KEY = exports.AXIOS_CONFIG_SHYFT_KEY = exports.EMAIL_TOKEN_SECRET = exports.EMAIL_EXPIRY_IN_DAYS = exports.SG_SENDER = exports.SENDGRID_KEY = exports.REFRESH_TOKEN_SECRET = exports.ACCESS_TOKEN_SECRET = exports.SHYFT_KEY = exports.SHYFT_URL = exports.HELLO_MOON_KEY = exports.HELLO_MOON_URL = exports.HELLO_MOON_RPC_URL = exports.RPC_URL = exports.__prod__ = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.__prod__ = process.env.NODE_ENV !== "production";
exports.RPC_URL = process.env.RPC_URL;
exports.HELLO_MOON_RPC_URL = process.env.HELLO_MOON_RPC_URL;
exports.HELLO_MOON_URL = `${process.env.HELLO_MOON_SERVER_URL}`;
exports.HELLO_MOON_KEY = `${process.env.HELLO_MOON_KEY}`;
exports.SHYFT_URL = `${process.env.SHYFT_SERVER_URL}`;
exports.SHYFT_KEY = `${process.env.SHYFT_KEY}`;
exports.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
exports.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
exports.SENDGRID_KEY = process.env.SENDGRID_KEY;
exports.SG_SENDER = process.env.SG_SENDER;
exports.EMAIL_EXPIRY_IN_DAYS = process.env.EMAIL_EXPIRY_IN_DAYS;
exports.EMAIL_TOKEN_SECRET = process.env.EMAIL_TOKEN_SECRET;
exports.AXIOS_CONFIG_SHYFT_KEY = {
    headers: {
        "Content-Type": "application/json",
        "x-api-key": exports.SHYFT_KEY,
    },
};
exports.AXIOS_CONFIG_HELLO_MOON_KEY = {
    headers: {
        Authorization: `Bearer ${exports.HELLO_MOON_KEY}`,
    },
};
//# sourceMappingURL=constants.js.map