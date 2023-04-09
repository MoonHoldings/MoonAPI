"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AXIOS_CONFIG_HELLO_MOON_KEY = exports.HELLO_MOON_KEY = exports.RPC_URL = exports.__prod__ = void 0;
exports.__prod__ = process.env.NODE_ENV !== "production";
exports.RPC_URL = process.env.RPC_URL;
exports.HELLO_MOON_KEY = `${process.env.HELLO_MOON_KEY}`;
exports.AXIOS_CONFIG_HELLO_MOON_KEY = {
    headers: {
        Authorization: `Bearer ${exports.HELLO_MOON_KEY}`,
    },
};
//# sourceMappingURL=constants.js.map