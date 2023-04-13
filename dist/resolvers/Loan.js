"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.LoanResolver = void 0;
const type_graphql_1 = require("type-graphql");
const typedi_1 = __importDefault(require("typedi"));
const services_1 = require("../services");
const entities_1 = require("../entities");
const types_1 = require("../types");
let LoanResolver = class LoanResolver {
    constructor() {
        this.loanService = typedi_1.default.get(services_1.LoanService);
    }
    getLoan(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.loanService.getLoanById(id);
        });
    }
    getLoans(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.loanService.getLoans(args);
        });
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => entities_1.Loan),
    __param(0, (0, type_graphql_1.Arg)("id", () => Number)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], LoanResolver.prototype, "getLoan", null);
__decorate([
    (0, type_graphql_1.Query)(() => types_1.PaginatedLoanResponse),
    __param(0, (0, type_graphql_1.Arg)("args", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [types_1.GetLoansArgs]),
    __metadata("design:returntype", Promise)
], LoanResolver.prototype, "getLoans", null);
LoanResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], LoanResolver);
exports.LoanResolver = LoanResolver;
//# sourceMappingURL=Loan.js.map