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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderBookService = void 0;
const types_1 = require("../types");
const entities_1 = require("../entities");
const typedi_1 = require("typedi");
const web3_js_1 = require("@solana/web3.js");
const apyAfterFee_1 = __importDefault(require("../utils/apyAfterFee"));
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        return __awaiter(this, void 0, void 0, function* () {
            let query = entities_1.OrderBook.createQueryBuilder("orderBook")
                .select("orderBook.id", "id")
                .addSelect("orderBook.pubKey", "pubKey")
                .addSelect("nftList.collectionName", "collectionName")
                .addSelect("nftList.collectionImage", "collectionImage")
                .addSelect("nftList.floorPrice", "floorPrice")
                .addSelect("orderBook.apy", "apy")
                .addSelect("orderBook.duration", "duration")
                .addSelect("orderBook.feePermillicentage", "feePermillicentage")
                .addSelect("COALESCE(SUM(CASE WHEN loan.state = 'offered' THEN loan.principalLamports ELSE 0 END), 0)", "totalpool")
                .addSelect("COALESCE(MAX(CASE WHEN loan.state = 'offered' THEN loan.principalLamports ELSE 0 END), 0)", "bestoffer")
                .innerJoin("orderBook.nftList", "nftList")
                .leftJoin("orderBook.loans", "loan");
            if ((_a = args === null || args === void 0 ? void 0 : args.filter) === null || _a === void 0 ? void 0 : _a.search) {
                query.where("nftList.collectionName ILIKE :name", { name: `%${args.filter.search}%` });
            }
            const count = yield query.getCount();
            if ((_b = args === null || args === void 0 ? void 0 : args.pagination) === null || _b === void 0 ? void 0 : _b.offset) {
                query.offset(args.pagination.offset);
            }
            if ((_c = args === null || args === void 0 ? void 0 : args.pagination) === null || _c === void 0 ? void 0 : _c.limit) {
                query.limit(args.pagination.limit);
            }
            query.groupBy("orderBook.id, nftList.collectionName, nftList.collectionImage, nftList.floorPrice");
            switch ((_d = args === null || args === void 0 ? void 0 : args.sort) === null || _d === void 0 ? void 0 : _d.type) {
                case types_1.OrderBookSortType.Apy:
                    query.orderBy("apy", (_f = (_e = args === null || args === void 0 ? void 0 : args.sort) === null || _e === void 0 ? void 0 : _e.order) !== null && _f !== void 0 ? _f : types_1.SortOrder.Desc);
                    break;
                case types_1.OrderBookSortType.Collection:
                    query.orderBy("nftList.collectionName", (_h = (_g = args === null || args === void 0 ? void 0 : args.sort) === null || _g === void 0 ? void 0 : _g.order) !== null && _h !== void 0 ? _h : types_1.SortOrder.Desc);
                    break;
                case types_1.OrderBookSortType.Duration:
                    query.orderBy("duration", (_k = (_j = args === null || args === void 0 ? void 0 : args.sort) === null || _j === void 0 ? void 0 : _j.order) !== null && _k !== void 0 ? _k : types_1.SortOrder.Desc);
                    break;
                case types_1.OrderBookSortType.TotalPool:
                    query.orderBy("totalpool", (_m = (_l = args === null || args === void 0 ? void 0 : args.sort) === null || _l === void 0 ? void 0 : _l.order) !== null && _m !== void 0 ? _m : types_1.SortOrder.Desc);
                    break;
                case types_1.OrderBookSortType.BestOffer:
                    query.orderBy("bestoffer", (_p = (_o = args === null || args === void 0 ? void 0 : args.sort) === null || _o === void 0 ? void 0 : _o.order) !== null && _p !== void 0 ? _p : types_1.SortOrder.Desc);
                    break;
                default:
                    query.orderBy("totalpool", (_r = (_q = args === null || args === void 0 ? void 0 : args.sort) === null || _q === void 0 ? void 0 : _q.order) !== null && _r !== void 0 ? _r : types_1.SortOrder.Desc);
                    break;
            }
            const rawData = yield query.getRawMany();
            const orderBooks = rawData.map((orderBook) => ({
                id: orderBook.id,
                pubKey: orderBook.pubKey,
                apy: orderBook.apy,
                apyAfterFee: (0, apyAfterFee_1.default)(orderBook.apy, orderBook.duration, orderBook.feePermillicentage),
                duration: orderBook.duration,
                feePermillicentage: orderBook.feePermillicentage,
                collectionName: orderBook.collectionName,
                collectionImage: orderBook.collectionImage,
                floorPrice: orderBook.floorPrice,
                floorPriceSol: orderBook.floorPrice ? parseFloat(orderBook.floorPrice) / web3_js_1.LAMPORTS_PER_SOL : undefined,
                totalPool: parseFloat(orderBook.totalpool) / web3_js_1.LAMPORTS_PER_SOL,
                bestOffer: parseFloat(orderBook.bestoffer) / web3_js_1.LAMPORTS_PER_SOL,
            }));
            return {
                count,
                data: orderBooks,
            };
        });
    }
};
OrderBookService = __decorate([
    (0, typedi_1.Service)()
], OrderBookService);
exports.OrderBookService = OrderBookService;
//# sourceMappingURL=OrderBook.js.map