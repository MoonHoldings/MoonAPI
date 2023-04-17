"use strict";
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
exports.getLoans = exports.getLoanById = void 0;
const types_1 = require("../types");
const entities_1 = require("../entities");
const web3_js_1 = require("@solana/web3.js");
const getLoanById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield entities_1.Loan.findOneOrFail({ where: { id } });
});
exports.getLoanById = getLoanById;
const getLoans = (args) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3;
    let where = {
        state: (_a = args === null || args === void 0 ? void 0 : args.filter) === null || _a === void 0 ? void 0 : _a.type,
    };
    const lenderWallet = (_b = args.filter) === null || _b === void 0 ? void 0 : _b.lenderWallet;
    const borrowerWallet = (_c = args === null || args === void 0 ? void 0 : args.filter) === null || _c === void 0 ? void 0 : _c.borrowerWallet;
    if ((_d = args.filter) === null || _d === void 0 ? void 0 : _d.lenderWallet) {
        where = [
            {
                lenderWallet,
            },
            {
                lenderNoteMint: lenderWallet,
            },
        ];
    }
    if (borrowerWallet) {
        where = {
            borrowerNoteMint: borrowerWallet,
        };
    }
    let totalOffers;
    let totalActive;
    let offerCount;
    let activeCount;
    if (((_e = args === null || args === void 0 ? void 0 : args.filter) === null || _e === void 0 ? void 0 : _e.orderBookId) || ((_f = args === null || args === void 0 ? void 0 : args.filter) === null || _f === void 0 ? void 0 : _f.orderBookPubKey)) {
        offerCount = yield entities_1.Loan.count({ where: { state: types_1.LoanType.Offer, orderBook: { id: (_g = args === null || args === void 0 ? void 0 : args.filter) === null || _g === void 0 ? void 0 : _g.orderBookId, pubKey: (_h = args === null || args === void 0 ? void 0 : args.filter) === null || _h === void 0 ? void 0 : _h.orderBookPubKey } } });
        activeCount = yield entities_1.Loan.count({ where: { state: types_1.LoanType.Taken, orderBook: { id: (_j = args === null || args === void 0 ? void 0 : args.filter) === null || _j === void 0 ? void 0 : _j.orderBookId, pubKey: (_k = args === null || args === void 0 ? void 0 : args.filter) === null || _k === void 0 ? void 0 : _k.orderBookPubKey } } });
    }
    if ((_l = args === null || args === void 0 ? void 0 : args.filter) === null || _l === void 0 ? void 0 : _l.orderBookPubKey) {
        where['orderBook'] = {
            pubKey: (_m = args === null || args === void 0 ? void 0 : args.filter) === null || _m === void 0 ? void 0 : _m.orderBookPubKey,
        };
        const orderBook = yield entities_1.OrderBook.findOneBy({ pubKey: (_o = args === null || args === void 0 ? void 0 : args.filter) === null || _o === void 0 ? void 0 : _o.orderBookPubKey });
        const loanQuery = entities_1.Loan.createQueryBuilder('loan')
            .select('SUM(CASE WHEN loan.state = :offer THEN loan.principalLamports ELSE 0 END)', 'totalOffers')
            .addSelect('SUM(CASE WHEN loan.state = :taken THEN loan.principalLamports ELSE 0 END)', 'totalActive')
            .where('loan.orderBookId = :id', { id: orderBook === null || orderBook === void 0 ? void 0 : orderBook.id })
            .setParameter('offer', types_1.LoanType.Offer)
            .setParameter('taken', types_1.LoanType.Taken);
        const [result] = yield loanQuery.getRawMany();
        const { totalOffers: offers, totalActive: active } = result;
        totalOffers = parseFloat(offers !== null && offers !== void 0 ? offers : 0) / web3_js_1.LAMPORTS_PER_SOL;
        totalActive = parseFloat(active !== null && active !== void 0 ? active : 0) / web3_js_1.LAMPORTS_PER_SOL;
    }
    if ((_p = args === null || args === void 0 ? void 0 : args.filter) === null || _p === void 0 ? void 0 : _p.orderBookId) {
        where['orderBook'] = {
            id: (_q = args === null || args === void 0 ? void 0 : args.filter) === null || _q === void 0 ? void 0 : _q.orderBookId,
        };
        const loanQuery = entities_1.Loan.createQueryBuilder('loan')
            .select('SUM(CASE WHEN loan.state = :offer THEN loan.principalLamports ELSE 0 END)', 'totalOffers')
            .addSelect('SUM(CASE WHEN loan.state = :taken THEN loan.principalLamports ELSE 0 END)', 'totalActive')
            .where('loan.orderBookId = :id', { id: (_r = args === null || args === void 0 ? void 0 : args.filter) === null || _r === void 0 ? void 0 : _r.orderBookId })
            .setParameter('offer', types_1.LoanType.Offer)
            .setParameter('taken', types_1.LoanType.Taken);
        const [result] = yield loanQuery.getRawMany();
        const { totalOffers: offers, totalActive: active } = result;
        totalOffers = parseFloat(offers !== null && offers !== void 0 ? offers : 0) / web3_js_1.LAMPORTS_PER_SOL;
        totalActive = parseFloat(active !== null && active !== void 0 ? active : 0) / web3_js_1.LAMPORTS_PER_SOL;
    }
    let order;
    switch ((_s = args === null || args === void 0 ? void 0 : args.sort) === null || _s === void 0 ? void 0 : _s.type) {
        case types_1.LoanSortType.Amount:
            order = { principalLamports: (_u = (_t = args === null || args === void 0 ? void 0 : args.sort) === null || _t === void 0 ? void 0 : _t.order) !== null && _u !== void 0 ? _u : types_1.SortOrder.Desc };
            break;
        case types_1.LoanSortType.Time:
            order = ((_v = args === null || args === void 0 ? void 0 : args.filter) === null || _v === void 0 ? void 0 : _v.type) === types_1.LoanType.Offer ? { offerTime: (_x = (_w = args === null || args === void 0 ? void 0 : args.sort) === null || _w === void 0 ? void 0 : _w.order) !== null && _x !== void 0 ? _x : types_1.SortOrder.Desc } : { start: (_z = (_y = args === null || args === void 0 ? void 0 : args.sort) === null || _y === void 0 ? void 0 : _y.order) !== null && _z !== void 0 ? _z : types_1.SortOrder.Desc };
            break;
        default:
            order = { principalLamports: (_1 = (_0 = args === null || args === void 0 ? void 0 : args.sort) === null || _0 === void 0 ? void 0 : _0.order) !== null && _1 !== void 0 ? _1 : types_1.SortOrder.Desc };
            break;
    }
    const loans = yield entities_1.Loan.find({
        take: (_2 = args === null || args === void 0 ? void 0 : args.pagination) === null || _2 === void 0 ? void 0 : _2.limit,
        skip: (_3 = args === null || args === void 0 ? void 0 : args.pagination) === null || _3 === void 0 ? void 0 : _3.offset,
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
exports.getLoans = getLoans;
//# sourceMappingURL=Loan.js.map