"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderBookService = void 0;
const types_1 = require("../types");
const entities_1 = require("../entities");
const typedi_1 = require("typedi");
const typeorm_1 = require("typeorm");
let OrderBookService = class OrderBookService {
    getOrderBookById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield entities_1.OrderBook.findOneOrFail({
                where: { id },
                relations: {
                    nftList: true,
                    loans: true,
                },
            });
        });
    }
    getOrderBooks(args) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            let order = {};
            if ((_a = args.filter) === null || _a === void 0 ? void 0 : _a.search) {
                where["nftList"] = { collectionName: (0, typeorm_1.ILike)(`%${(_b = args.filter) === null || _b === void 0 ? void 0 : _b.search}%`) };
            }
            switch ((_c = args.sort) === null || _c === void 0 ? void 0 : _c.type) {
                case types_1.OrderBookSortType.Apy:
                    order = { apy: args.sort.order };
                    break;
                case types_1.OrderBookSortType.Collection:
                    order = { nftList: { collectionName: types_1.SortOrder.Asc } };
                    break;
                case types_1.OrderBookSortType.Duration:
                    order = { duration: args.sort.order };
                    break;
                case types_1.OrderBookSortType.TotalPool:
                    break;
                case types_1.OrderBookSortType.BestOffer:
                    break;
                default:
                    order = { nftList: { collectionName: types_1.SortOrder.Asc } };
                    break;
            }
            const data = yield entities_1.OrderBook.find({
                order,
                skip: (_d = args.pagination) === null || _d === void 0 ? void 0 : _d.offset,
                take: (_e = args.pagination) === null || _e === void 0 ? void 0 : _e.limit,
                where,
                relations: { nftList: true, loans: true },
            });
            return {
                count: yield entities_1.OrderBook.count({ where }),
                data,
            };
        });
    }
};
OrderBookService = __decorate([
    (0, typedi_1.Service)()
], OrderBookService);
exports.OrderBookService = OrderBookService;
//# sourceMappingURL=OrderBook.js.map