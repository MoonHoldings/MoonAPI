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
exports.LoanService = void 0;
const types_1 = require("../types");
const entities_1 = require("../entities");
const typedi_1 = require("typedi");
let LoanService = class LoanService {
    getLoanById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield entities_1.Loan.findOneOrFail({ where: { id } });
        });
    }
    getLoans(args) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        return __awaiter(this, void 0, void 0, function* () {
            const where = {
                state: (_a = args === null || args === void 0 ? void 0 : args.filter) === null || _a === void 0 ? void 0 : _a.type,
                lenderWallet: (_b = args === null || args === void 0 ? void 0 : args.filter) === null || _b === void 0 ? void 0 : _b.lenderWallet,
                borrowerNoteMint: (_c = args === null || args === void 0 ? void 0 : args.filter) === null || _c === void 0 ? void 0 : _c.borrowerWallet,
            };
            if ((_d = args === null || args === void 0 ? void 0 : args.filter) === null || _d === void 0 ? void 0 : _d.orderBookPubKey) {
                where["orderBook"] = {
                    pubKey: (_e = args === null || args === void 0 ? void 0 : args.filter) === null || _e === void 0 ? void 0 : _e.orderBookPubKey,
                };
            }
            let order;
            switch ((_f = args === null || args === void 0 ? void 0 : args.sort) === null || _f === void 0 ? void 0 : _f.type) {
                case types_1.LoanSortType.Amount:
                    order = { principalLamports: (_h = (_g = args === null || args === void 0 ? void 0 : args.sort) === null || _g === void 0 ? void 0 : _g.order) !== null && _h !== void 0 ? _h : types_1.SortOrder.Desc };
                    break;
                case types_1.LoanSortType.Time:
                    order = ((_j = args === null || args === void 0 ? void 0 : args.filter) === null || _j === void 0 ? void 0 : _j.type) === types_1.LoanType.Offer ? { offerTime: (_l = (_k = args === null || args === void 0 ? void 0 : args.sort) === null || _k === void 0 ? void 0 : _k.order) !== null && _l !== void 0 ? _l : types_1.SortOrder.Desc } : { start: (_o = (_m = args === null || args === void 0 ? void 0 : args.sort) === null || _m === void 0 ? void 0 : _m.order) !== null && _o !== void 0 ? _o : types_1.SortOrder.Desc };
                    break;
                default:
                    order = { principalLamports: (_q = (_p = args === null || args === void 0 ? void 0 : args.sort) === null || _p === void 0 ? void 0 : _p.order) !== null && _q !== void 0 ? _q : types_1.SortOrder.Desc };
                    break;
            }
            const loans = yield entities_1.Loan.find({
                take: (_r = args === null || args === void 0 ? void 0 : args.pagination) === null || _r === void 0 ? void 0 : _r.limit,
                skip: (_s = args === null || args === void 0 ? void 0 : args.pagination) === null || _s === void 0 ? void 0 : _s.offset,
                where,
                order,
                relations: {
                    orderBook: {
                        nftList: true,
                    },
                },
            });
            return {
                count: yield entities_1.Loan.count({ where }),
                data: loans,
            };
        });
    }
};
LoanService = __decorate([
    (0, typedi_1.Service)()
], LoanService);
exports.LoanService = LoanService;
//# sourceMappingURL=Loan.js.map