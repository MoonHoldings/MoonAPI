"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connection = void 0;
const anchor_1 = require("@project-serum/anchor");
const nodewallet_1 = __importDefault(require("@project-serum/anchor/dist/cjs/nodewallet"));
const web3_js_1 = require("@solana/web3.js");
const constants_1 = require("../constants");
exports.connection = new web3_js_1.Connection(constants_1.RPC_URL, "confirmed");
const createAnchorProvider = (wallet, rpc) => {
    const provider = new anchor_1.AnchorProvider(new web3_js_1.Connection((constants_1.RPC_URL !== null && constants_1.RPC_URL !== void 0 ? constants_1.RPC_URL : rpc), "confirmed"), wallet !== null && wallet !== void 0 ? wallet : new nodewallet_1.default(web3_js_1.Keypair.generate()), {
        maxRetries: 2,
    });
    provider.connection._confirmTransactionInitialTimeout = 180000;
    return provider;
};
exports.default = createAnchorProvider;
//# sourceMappingURL=createAnchorProvider.js.map