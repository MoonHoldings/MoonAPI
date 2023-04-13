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
exports.OrderBook = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Loan_1 = require("./Loan");
const NftList_1 = require("./NftList");
const web3_js_1 = require("@solana/web3.js");
const types_1 = require("../types");
const apyAfterFee_1 = __importDefault(require("../utils/apyAfterFee"));
let OrderBook = class OrderBook extends typeorm_1.BaseEntity {
    apyAfterFee() {
        return (0, apyAfterFee_1.default)(this.apy, this.duration, this.feePermillicentage);
    }
    bestOffer() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = Loan_1.Loan.createQueryBuilder("loan")
                .select("MAX(loan.principalLamports)", "bestOffer")
                .where("loan.orderBookId = :id", { id: this.id })
                .andWhere("loan.state = :state", { state: types_1.LoanType.Offer });
            const { bestOffer } = yield query.getRawOne();
            return bestOffer ? parseInt(bestOffer) / web3_js_1.LAMPORTS_PER_SOL : 0;
        });
    }
    totalPool() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = Loan_1.Loan.createQueryBuilder("loan")
                .select("SUM(loan.principalLamports)", "totalPool")
                .where("loan.orderBookId = :id", { id: this.id })
                .andWhere("loan.state = :state", { state: types_1.LoanType.Offer });
            const { totalPool } = yield query.getRawOne();
            return totalPool ? parseInt(totalPool) / web3_js_1.LAMPORTS_PER_SOL : 0;
        });
    }
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], OrderBook.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.Column)("text", { unique: true }),
    __metadata("design:type", String)
], OrderBook.prototype, "pubKey", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.Column)("integer"),
    __metadata("design:type", Number)
], OrderBook.prototype, "version", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    (0, typeorm_1.Column)("integer", { nullable: true }),
    __metadata("design:type", Number)
], OrderBook.prototype, "apy", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Number)
], OrderBook.prototype, "apyAfterFee", null);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.Column)("text"),
    __metadata("design:type", String)
], OrderBook.prototype, "listAccount", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    (0, typeorm_1.Column)("integer", { nullable: true }),
    __metadata("design:type", Number)
], OrderBook.prototype, "duration", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    (0, typeorm_1.Column)("integer", { nullable: true }),
    __metadata("design:type", Number)
], OrderBook.prototype, "feePermillicentage", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.Column)("text"),
    __metadata("design:type", String)
], OrderBook.prototype, "feeAuthority", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Loan_1.Loan], { nullable: true }),
    (0, typeorm_1.OneToMany)(() => Loan_1.Loan, (loan) => loan.orderBook, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], OrderBook.prototype, "loans", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => NftList_1.NftList, { nullable: true }),
    (0, typeorm_1.OneToOne)(() => NftList_1.NftList, (nftList) => nftList.orderBook, { nullable: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Object)
], OrderBook.prototype, "nftList", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrderBook.prototype, "bestOffer", null);
__decorate([
    (0, type_graphql_1.Field)(() => Number),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrderBook.prototype, "totalPool", null);
OrderBook = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)()
], OrderBook);
exports.OrderBook = OrderBook;
//# sourceMappingURL=OrderBook.js.map