"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const Loan_1 = require("../entities/Loan");
const OrderBook_1 = require("../entities/OrderBook");
const NftList_1 = require("../entities/NftList");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: 5432,
    entities: [Loan_1.Loan, OrderBook_1.OrderBook, NftList_1.NftList],
    synchronize: true,
    logging: process.env.NODE_ENV === "development",
});
//# sourceMappingURL=db.js.map