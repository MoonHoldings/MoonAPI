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
exports.Loan = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const OrderBook_1 = require("./OrderBook");
let Loan = class Loan extends typeorm_1.BaseEntity {
    constructor() {
        super(...arguments);
        this.supportsFreezingCollateral = true;
        this.isCollateralFrozen = false;
        this.isHistorical = false;
        this.isForeclosable = false;
    }
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Loan.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Loan.prototype, "pubKey", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], Loan.prototype, "version", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number),
    (0, typeorm_1.Column)('bigint'),
    __metadata("design:type", Number)
], Loan.prototype, "principalLamports", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => OrderBook_1.OrderBook),
    (0, typeorm_1.ManyToOne)(() => OrderBook_1.OrderBook, (orderBook) => orderBook.loans),
    __metadata("design:type", Object)
], Loan.prototype, "orderBook", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Loan.prototype, "valueTokenMint", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { defaultValue: true }),
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Loan.prototype, "supportsFreezingCollateral", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { defaultValue: false }),
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Loan.prototype, "isCollateralFrozen", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { defaultValue: false }),
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Loan.prototype, "isHistorical", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { defaultValue: false }),
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Loan.prototype, "isForeclosable", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Loan.prototype, "state", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number, { nullable: true }),
    (0, typeorm_1.Column)('bigint', { nullable: true }),
    __metadata("design:type", Object)
], Loan.prototype, "duration", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Loan.prototype, "lenderWallet", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number, { nullable: true }),
    (0, typeorm_1.Column)('bigint', { nullable: true }),
    __metadata("design:type", Object)
], Loan.prototype, "offerTime", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Loan.prototype, "nftCollateralMint", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Loan.prototype, "lenderNoteMint", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Loan.prototype, "borrowerNoteMint", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    (0, typeorm_1.Column)('integer', { nullable: true }),
    __metadata("design:type", Object)
], Loan.prototype, "apy", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number, { nullable: true }),
    (0, typeorm_1.Column)('bigint', { nullable: true }),
    __metadata("design:type", Object)
], Loan.prototype, "start", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number, { nullable: true }),
    (0, typeorm_1.Column)('bigint', { nullable: true }),
    __metadata("design:type", Object)
], Loan.prototype, "totalOwedLamports", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Loan.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Loan.prototype, "updatedAt", void 0);
Loan = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)()
], Loan);
exports.Loan = Loan;
//# sourceMappingURL=Loan.js.map