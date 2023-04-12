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
exports.OrderBookPaginatedResponse = exports.LoansPaginatedResponse = void 0;
const entities_1 = require("../entities");
const type_graphql_1 = require("type-graphql");
let LoansPaginatedResponse = class LoansPaginatedResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], LoansPaginatedResponse.prototype, "count", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [entities_1.Loan]),
    __metadata("design:type", Array)
], LoansPaginatedResponse.prototype, "data", void 0);
LoansPaginatedResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], LoansPaginatedResponse);
exports.LoansPaginatedResponse = LoansPaginatedResponse;
let OrderBookPaginatedResponse = class OrderBookPaginatedResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], OrderBookPaginatedResponse.prototype, "count", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [entities_1.OrderBook]),
    __metadata("design:type", Array)
], OrderBookPaginatedResponse.prototype, "data", void 0);
OrderBookPaginatedResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], OrderBookPaginatedResponse);
exports.OrderBookPaginatedResponse = OrderBookPaginatedResponse;
//# sourceMappingURL=objectTypes.js.map