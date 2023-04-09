"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const nestjs_command_1 = require("nestjs-command");
const sharkify_service_1 = require("./sharkify.service");
const sharkify_commands_1 = require("../commands/sharkify.commands");
const Loan_1 = require("../entities/Loan");
const OrderBook_1 = require("../entities/OrderBook");
const NftList_1 = require("../entities/NftList");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let TasksModule = class TasksModule {
};
TasksModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            nestjs_command_1.CommandModule,
            typeorm_1.TypeOrmModule.forRoot({
                type: "postgres",
                host: process.env.DB_HOST,
                port: 5432,
                username: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_NAME,
                entities: [Loan_1.Loan, OrderBook_1.OrderBook, NftList_1.NftList],
                synchronize: true,
                logging: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([Loan_1.Loan, OrderBook_1.OrderBook, NftList_1.NftList]),
        ],
        providers: [sharkify_service_1.SharkifyService, sharkify_commands_1.SharkifyCommands],
    })
], TasksModule);
exports.TasksModule = TasksModule;
//# sourceMappingURL=tasks.module.js.map