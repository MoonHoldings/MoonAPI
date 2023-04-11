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
exports.NftList = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const OrderBook_1 = require("./OrderBook");
let NftList = class NftList extends typeorm_1.BaseEntity {
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], NftList.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.Column)("text", { unique: true }),
    __metadata("design:type", String)
], NftList.prototype, "pubKey", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.Column)("text"),
    __metadata("design:type", String)
], NftList.prototype, "version", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.Column)("text"),
    __metadata("design:type", String)
], NftList.prototype, "nftMint", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.Column)("text"),
    __metadata("design:type", String)
], NftList.prototype, "collectionName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)("text", { nullable: true }),
    __metadata("design:type", String)
], NftList.prototype, "collectionImage", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => OrderBook_1.OrderBook, (orderBook) => orderBook.nftList, { cascade: true }),
    __metadata("design:type", OrderBook_1.OrderBook)
], NftList.prototype, "orderBook", void 0);
NftList = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)()
], NftList);
exports.NftList = NftList;
//# sourceMappingURL=NftList.js.map