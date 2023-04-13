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
exports.PaginatedOrderBookResponse = exports.OrderBookList = exports.PaginatedLoanResponse = void 0;
const entities_1 = require("../entities");
const type_graphql_1 = require("type-graphql");
let PaginatedLoanResponse = class PaginatedLoanResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], PaginatedLoanResponse.prototype, "count", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [entities_1.Loan]),
    __metadata("design:type", Array)
], PaginatedLoanResponse.prototype, "data", void 0);
PaginatedLoanResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], PaginatedLoanResponse);
exports.PaginatedLoanResponse = PaginatedLoanResponse;
let OrderBookList = class OrderBookList {
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], OrderBookList.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], OrderBookList.prototype, "apy", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number, { nullable: true }),
    __metadata("design:type", Number)
], OrderBookList.prototype, "apyAfterFee", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], OrderBookList.prototype, "duration", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], OrderBookList.prototype, "feePermillicentage", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], OrderBookList.prototype, "collectionName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], OrderBookList.prototype, "collectionImage", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number, { nullable: true }),
    __metadata("design:type", Number)
], OrderBookList.prototype, "floorPrice", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number, { nullable: true }),
    __metadata("design:type", Number)
], OrderBookList.prototype, "totalPool", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number, { nullable: true }),
    __metadata("design:type", Number)
], OrderBookList.prototype, "bestOffer", void 0);
OrderBookList = __decorate([
    (0, type_graphql_1.ObjectType)()
], OrderBookList);
exports.OrderBookList = OrderBookList;
let PaginatedOrderBookResponse = class PaginatedOrderBookResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], PaginatedOrderBookResponse.prototype, "count", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [OrderBookList]),
    __metadata("design:type", Array)
], PaginatedOrderBookResponse.prototype, "data", void 0);
PaginatedOrderBookResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], PaginatedOrderBookResponse);
exports.PaginatedOrderBookResponse = PaginatedOrderBookResponse;
//# sourceMappingURL=objectTypes.js.map