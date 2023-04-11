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
const apollo_server_express_1 = require("apollo-server-express");
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const type_graphql_1 = require("type-graphql");
const cors_1 = __importDefault(require("cors"));
const constants_1 = require("./constants");
const db_1 = require("./utils/db");
const Loan_1 = require("./resolvers/Loan");
const OrderBook_1 = require("./resolvers/OrderBook");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const app = (0, express_1.default)();
    const whitelist = ["http://localhost:3000", "https://studio.apollographql.com"];
    const corsOptions = {
        origin: function (origin, callback) {
            if (whitelist.indexOf(origin) !== -1) {
                callback(null, true);
            }
            else {
                callback();
            }
        },
        credentials: true,
    };
    app.use((0, cors_1.default)(corsOptions));
    app.use((0, express_session_1.default)({
        name: "qid",
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
            httpOnly: true,
            sameSite: "lax",
            secure: !constants_1.__prod__,
        },
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET ? process.env.SESSION_SECRET : "",
        resave: false,
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: yield (0, type_graphql_1.buildSchema)({
            resolvers: [Loan_1.LoanResolver, OrderBook_1.OrderBookResolver],
            validate: false,
        }),
        csrfPrevention: false,
        context: ({ req, res }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield db_1.AppDataSource.initialize();
            }
            catch (_) { }
            return {
                req,
                res,
            };
        }),
    });
    yield apolloServer.start();
    apolloServer.applyMiddleware({ app, cors: false });
    app.listen(process.env.PORT || 80, () => {
        var _a;
        console.log(`server started at http://localhost:${(_a = process.env.PORT) !== null && _a !== void 0 ? _a : ""}/graphql`);
    });
});
main().catch((err) => {
    console.log(err);
});
//# sourceMappingURL=index.js.map