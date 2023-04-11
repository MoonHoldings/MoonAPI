"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@sharkyfi/client");
const createAnchorProvider_1 = __importDefault(require("./createAnchorProvider"));
const provider = (0, createAnchorProvider_1.default)();
const sharkyClient = (0, client_1.createSharkyClient)(provider);
exports.default = sharkyClient;
//# sourceMappingURL=sharkyClient.js.map