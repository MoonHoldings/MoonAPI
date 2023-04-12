"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AXIOS_CONFIG_HELLO_MOON_KEY = exports.AXIOS_CONFIG_SHYFT_KEY = exports.SHYFT_KEY = exports.SHYFT_URL = exports.HELLO_MOON_KEY = exports.HELLO_MOON_URL = exports.RPC_URL = exports.__prod__ = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.__prod__ = process.env.NODE_ENV !== "production";
exports.RPC_URL = process.env.RPC_URL;
exports.HELLO_MOON_URL = `${process.env.HELLO_MOON_SERVER_URL}`;
exports.HELLO_MOON_KEY = `${process.env.HELLO_MOON_KEY}`;
exports.SHYFT_URL = `${process.env.SHYFT_SERVER_URL}`;
exports.SHYFT_KEY = `${process.env.SHYFT_KEY}`;
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