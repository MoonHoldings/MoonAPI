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
exports.GetOrderBooksArgs = exports.OrderBookSort = exports.GetOrderBooksFilter = exports.GetLoansArgs = exports.LoanSort = exports.GetLoansFilter = exports.LimitOffset = void 0;
const type_graphql_1 = require("type-graphql");
const enums_1 = require("./enums");
let LimitOffset = class LimitOffset {
};
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], LimitOffset.prototype, "limit", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], LimitOffset.prototype, "offset", void 0);
LimitOffset = __decorate([
    (0, type_graphql_1.InputType)()
], LimitOffset);
exports.LimitOffset = LimitOffset;
let GetLoansFilter = class GetLoansFilter {
};
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], GetLoansFilter.prototype, "type", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], GetLoansFilter.prototype, "lenderWallet", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], GetLoansFilter.prototype, "borrowerWallet", void 0);
GetLoansFilter = __decorate([
    (0, type_graphql_1.InputType)()
], GetLoansFilter);
exports.GetLoansFilter = GetLoansFilter;
let LoanSort = class LoanSort {
};
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], LoanSort.prototype, "type", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], LoanSort.prototype, "order", void 0);
LoanSort = __decorate([
    (0, type_graphql_1.InputType)()
], LoanSort);
exports.LoanSort = LoanSort;
let GetLoansArgs = class GetLoansArgs {
};
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", GetLoansFilter)
], GetLoansArgs.prototype, "filter", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", LimitOffset)
], GetLoansArgs.prototype, "pagination", void 0);
GetLoansArgs = __decorate([
    (0, type_graphql_1.InputType)()
], GetLoansArgs);
exports.GetLoansArgs = GetLoansArgs;
let GetOrderBooksFilter = class GetOrderBooksFilter {
};
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], GetOrderBooksFilter.prototype, "search", void 0);
GetOrderBooksFilter = __decorate([
    (0, type_graphql_1.InputType)()
], GetOrderBooksFilter);
exports.GetOrderBooksFilter = GetOrderBooksFilter;
let OrderBookSort = class OrderBookSort {
};
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OrderBookSort.prototype, "type", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OrderBookSort.prototype, "order", void 0);
OrderBookSort = __decorate([
    (0, type_graphql_1.InputType)()
], OrderBookSort);
exports.OrderBookSort = OrderBookSort;
let GetOrderBooksArgs = class GetOrderBooksArgs {
};
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", GetOrderBooksFilter)
], GetOrderBooksArgs.prototype, "filter", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", LimitOffset)
], GetOrderBooksArgs.prototype, "pagination", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", OrderBookSort)
], GetOrderBooksArgs.prototype, "sort", void 0);
GetOrderBooksArgs = __decorate([
    (0, type_graphql_1.InputType)()
], GetOrderBooksArgs);
exports.GetOrderBooksArgs = GetOrderBooksArgs;
//# sourceMappingURL=inputTypes.js.map