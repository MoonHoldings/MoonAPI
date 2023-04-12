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
exports.GetLoansArgs = exports.GetLoansFilter = exports.LimitOffset = void 0;
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
//# sourceMappingURL=inputTypes.js.map