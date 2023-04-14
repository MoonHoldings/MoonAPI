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
const web3_js_1 = require("@solana/web3.js");
let LoanService = class LoanService {
    getLoanById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield entities_1.Loan.findOneOrFail({ where: { id } });
        });
    }
    getLoans(args) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2;
        return __awaiter(this, void 0, void 0, function* () {
            const where = {
                state: (_a = args === null || args === void 0 ? void 0 : args.filter) === null || _a === void 0 ? void 0 : _a.type,
                lenderWallet: (_b = args === null || args === void 0 ? void 0 : args.filter) === null || _b === void 0 ? void 0 : _b.lenderWallet,
                borrowerNoteMint: (_c = args === null || args === void 0 ? void 0 : args.filter) === null || _c === void 0 ? void 0 : _c.borrowerWallet,
            };
            let totalOffers;
            let totalActive;
            let offerCount;
            let activeCount;
            if (((_d = args === null || args === void 0 ? void 0 : args.filter) === null || _d === void 0 ? void 0 : _d.orderBookId) || ((_e = args === null || args === void 0 ? void 0 : args.filter) === null || _e === void 0 ? void 0 : _e.orderBookPubKey)) {
                offerCount = yield entities_1.Loan.count({ where: { state: types_1.LoanType.Offer, orderBook: { id: (_f = args === null || args === void 0 ? void 0 : args.filter) === null || _f === void 0 ? void 0 : _f.orderBookId, pubKey: (_g = args === null || args === void 0 ? void 0 : args.filter) === null || _g === void 0 ? void 0 : _g.orderBookPubKey } } });
                activeCount = yield entities_1.Loan.count({ where: { state: types_1.LoanType.Taken, orderBook: { id: (_h = args === null || args === void 0 ? void 0 : args.filter) === null || _h === void 0 ? void 0 : _h.orderBookId, pubKey: (_j = args === null || args === void 0 ? void 0 : args.filter) === null || _j === void 0 ? void 0 : _j.orderBookPubKey } } });
            }
            if ((_k = args === null || args === void 0 ? void 0 : args.filter) === null || _k === void 0 ? void 0 : _k.orderBookPubKey) {
                where["orderBook"] = {
                    pubKey: (_l = args === null || args === void 0 ? void 0 : args.filter) === null || _l === void 0 ? void 0 : _l.orderBookPubKey,
                };
                const orderBook = yield entities_1.OrderBook.findOneBy({ pubKey: (_m = args === null || args === void 0 ? void 0 : args.filter) === null || _m === void 0 ? void 0 : _m.orderBookPubKey });
                const loanQuery = entities_1.Loan.createQueryBuilder("loan")
                    .select("SUM(CASE WHEN loan.state = :offer THEN loan.principalLamports ELSE 0 END)", "totalOffers")
                    .addSelect("SUM(CASE WHEN loan.state = :taken THEN loan.principalLamports ELSE 0 END)", "totalActive")
                    .where("loan.orderBookId = :id", { id: orderBook === null || orderBook === void 0 ? void 0 : orderBook.id })
                    .setParameter("offer", types_1.LoanType.Offer)
                    .setParameter("taken", types_1.LoanType.Taken);
                const [result] = yield loanQuery.getRawMany();
                const { totalOffers: offers, totalActive: active } = result;
                totalOffers = parseFloat(offers !== null && offers !== void 0 ? offers : 0) / web3_js_1.LAMPORTS_PER_SOL;
                totalActive = parseFloat(active !== null && active !== void 0 ? active : 0) / web3_js_1.LAMPORTS_PER_SOL;
            }
            if ((_o = args === null || args === void 0 ? void 0 : args.filter) === null || _o === void 0 ? void 0 : _o.orderBookId) {
                where["orderBook"] = {
                    id: (_p = args === null || args === void 0 ? void 0 : args.filter) === null || _p === void 0 ? void 0 : _p.orderBookId,
                };
                const loanQuery = entities_1.Loan.createQueryBuilder("loan")
                    .select("SUM(CASE WHEN loan.state = :offer THEN loan.principalLamports ELSE 0 END)", "totalOffers")
                    .addSelect("SUM(CASE WHEN loan.state = :taken THEN loan.principalLamports ELSE 0 END)", "totalActive")
                    .where("loan.orderBookId = :id", { id: (_q = args === null || args === void 0 ? void 0 : args.filter) === null || _q === void 0 ? void 0 : _q.orderBookId })
                    .setParameter("offer", types_1.LoanType.Offer)
                    .setParameter("taken", types_1.LoanType.Taken);
                const [result] = yield loanQuery.getRawMany();
                const { totalOffers: offers, totalActive: active } = result;
                totalOffers = parseFloat(offers !== null && offers !== void 0 ? offers : 0) / web3_js_1.LAMPORTS_PER_SOL;
                totalActive = parseFloat(active !== null && active !== void 0 ? active : 0) / web3_js_1.LAMPORTS_PER_SOL;
            }
            let order;
            switch ((_r = args === null || args === void 0 ? void 0 : args.sort) === null || _r === void 0 ? void 0 : _r.type) {
                case types_1.LoanSortType.Amount:
                    order = { principalLamports: (_t = (_s = args === null || args === void 0 ? void 0 : args.sort) === null || _s === void 0 ? void 0 : _s.order) !== null && _t !== void 0 ? _t : types_1.SortOrder.Desc };
                    break;
                case types_1.LoanSortType.Time:
                    order = ((_u = args === null || args === void 0 ? void 0 : args.filter) === null || _u === void 0 ? void 0 : _u.type) === types_1.LoanType.Offer ? { offerTime: (_w = (_v = args === null || args === void 0 ? void 0 : args.sort) === null || _v === void 0 ? void 0 : _v.order) !== null && _w !== void 0 ? _w : types_1.SortOrder.Desc } : { start: (_y = (_x = args === null || args === void 0 ? void 0 : args.sort) === null || _x === void 0 ? void 0 : _x.order) !== null && _y !== void 0 ? _y : types_1.SortOrder.Desc };
                    break;
                default:
                    order = { principalLamports: (_0 = (_z = args === null || args === void 0 ? void 0 : args.sort) === null || _z === void 0 ? void 0 : _z.order) !== null && _0 !== void 0 ? _0 : types_1.SortOrder.Desc };
                    break;
            }
            const loans = yield entities_1.Loan.find({
                take: (_1 = args === null || args === void 0 ? void 0 : args.pagination) === null || _1 === void 0 ? void 0 : _1.limit,
                skip: (_2 = args === null || args === void 0 ? void 0 : args.pagination) === null || _2 === void 0 ? void 0 : _2.offset,
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
                totalActive,
                totalOffers,
                offerCount,
                activeCount,
            };
        });
    }
};
LoanService = __decorate([
    (0, typedi_1.Service)()
], LoanService);
exports.LoanService = LoanService;
//# sourceMappingURL=Loan.js.map