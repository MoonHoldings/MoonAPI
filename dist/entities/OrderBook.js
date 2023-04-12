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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderBook = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Loan_1 = require("./Loan");
const NftList_1 = require("./NftList");
let OrderBook = class OrderBook extends typeorm_1.BaseEntity {
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
OrderBook = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)()
], OrderBook);
exports.OrderBook = OrderBook;
//# sourceMappingURL=OrderBook.js.map