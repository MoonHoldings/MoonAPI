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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
var SharkifyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharkifyService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const date_fns_1 = require("date-fns");
const NftList_1 = require("../entities/NftList");
const Loan_1 = require("./../entities/Loan");
const OrderBook_1 = require("../entities/OrderBook");
const sharkyClient_1 = __importDefault(require("../utils/sharkyClient"));
const typeorm_2 = require("typeorm");
let SharkifyService = SharkifyService_1 = class SharkifyService {
    constructor(nftListRepository, orderBookRepository, loanRepository) {
        this.nftListRepository = nftListRepository;
        this.orderBookRepository = orderBookRepository;
        this.loanRepository = loanRepository;
        this.logger = new common_1.Logger(SharkifyService_1.name);
    }
    saveLoans() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug((0, date_fns_1.format)(new Date(), "'saveLoans start:' MMMM d, yyyy hh:mma"));
            console.log((0, date_fns_1.format)(new Date(), "'saveLoans start:' MMMM d, yyyy hh:mma"));
            const { program } = sharkyClient_1.default;
            let newLoans = yield sharkyClient_1.default.fetchAllLoans({ program });
            if (newLoans.length > 0) {
                const queriedOrderBooks = [];
                let loanEntities = yield Promise.all(newLoans.map((loan) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
                    let orderBook = queriedOrderBooks.find((orderBook) => orderBook.pubKey === loan.data.orderBook.toBase58());
                    if (!orderBook) {
                        orderBook = yield this.orderBookRepository.findOne({ where: { pubKey: loan.data.orderBook.toBase58() } });
                        if (orderBook) {
                            queriedOrderBooks.push(orderBook);
                        }
                    }
                    return this.loanRepository.create({
                        pubKey: loan.pubKey.toBase58(),
                        version: loan.data.version,
                        principalLamports: loan.data.principalLamports.toNumber(),
                        valueTokenMint: loan.data.valueTokenMint.toBase58(),
                        supportsFreezingCollateral: loan.supportsFreezingCollateral,
                        isCollateralFrozen: loan.isCollateralFrozen,
                        isHistorical: loan.isHistorical,
                        isForeclosable: loan.isForeclosable("mainnet"),
                        state: loan.state,
                        duration: ((_d = (_c = (_b = (_a = loan.data.loanState) === null || _a === void 0 ? void 0 : _a.offer) === null || _b === void 0 ? void 0 : _b.offer.termsSpec.time) === null || _c === void 0 ? void 0 : _c.duration) === null || _d === void 0 ? void 0 : _d.toNumber()) || ((_g = (_f = (_e = loan.data.loanState.taken) === null || _e === void 0 ? void 0 : _e.taken.terms.time) === null || _f === void 0 ? void 0 : _f.duration) === null || _g === void 0 ? void 0 : _g.toNumber()),
                        lenderWallet: (_h = loan.data.loanState.offer) === null || _h === void 0 ? void 0 : _h.offer.lenderWallet.toBase58(),
                        offerTime: (_k = (_j = loan.data.loanState.offer) === null || _j === void 0 ? void 0 : _j.offer.offerTime) === null || _k === void 0 ? void 0 : _k.toNumber(),
                        nftCollateralMint: (_l = loan.data.loanState.taken) === null || _l === void 0 ? void 0 : _l.taken.nftCollateralMint.toBase58(),
                        lenderNoteMint: (_m = loan.data.loanState.taken) === null || _m === void 0 ? void 0 : _m.taken.lenderNoteMint.toBase58(),
                        borrowerNoteMint: (_o = loan.data.loanState.taken) === null || _o === void 0 ? void 0 : _o.taken.borrowerNoteMint.toBase58(),
                        apy: (_q = (_p = loan.data.loanState.taken) === null || _p === void 0 ? void 0 : _p.taken.apy.fixed) === null || _q === void 0 ? void 0 : _q.apy,
                        start: (_t = (_s = (_r = loan.data.loanState.taken) === null || _r === void 0 ? void 0 : _r.taken.terms.time) === null || _s === void 0 ? void 0 : _s.start) === null || _t === void 0 ? void 0 : _t.toNumber(),
                        totalOwedLamports: (_w = (_v = (_u = loan.data.loanState.taken) === null || _u === void 0 ? void 0 : _u.taken.terms.time) === null || _v === void 0 ? void 0 : _v.totalOwedLamports) === null || _w === void 0 ? void 0 : _w.toNumber(),
                        orderBook: orderBook || undefined,
                    });
                })));
                yield this.loanRepository.query("ALTER SEQUENCE loan_id_seq RESTART WITH 1");
                yield this.loanRepository.delete({});
                yield this.loanRepository.save(loanEntities, { chunk: 50 });
            }
            this.logger.debug((0, date_fns_1.format)(new Date(), "'saveLoans end:' MMMM d, yyyy hh:mma"));
            console.log((0, date_fns_1.format)(new Date(), "'saveLoans end:' MMMM d, yyyy hh:mma"));
        });
    }
    saveOrderBooks() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug((0, date_fns_1.format)(new Date(), "'saveOrderBooks start:' MMMM d, yyyy hh:mma"));
            console.log((0, date_fns_1.format)(new Date(), "'saveOrderBooks start:' MMMM d, yyyy hh:mma"));
            const { program } = sharkyClient_1.default;
            const currentOrderBooks = yield this.orderBookRepository.find();
            let newOrderBooks = yield sharkyClient_1.default.fetchAllOrderBooks({ program });
            if (currentOrderBooks.length > 0) {
                newOrderBooks = newOrderBooks.filter((orderBook) => currentOrderBooks.find((n) => n.pubKey === orderBook.pubKey.toBase58()) === undefined);
            }
            if (newOrderBooks.length > 0) {
                const orderBookEntities = yield Promise.all(newOrderBooks.map((orderBook) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c, _d, _e;
                    const nftList = yield this.nftListRepository.findOne({ where: { pubKey: (_a = orderBook.orderBookType.nftList) === null || _a === void 0 ? void 0 : _a.listAccount.toBase58() } });
                    return this.orderBookRepository.create({
                        pubKey: orderBook.pubKey.toBase58(),
                        version: orderBook.version,
                        apy: (_b = orderBook.apy.fixed) === null || _b === void 0 ? void 0 : _b.apy,
                        listAccount: (_c = orderBook.orderBookType.nftList) === null || _c === void 0 ? void 0 : _c.listAccount.toBase58(),
                        duration: (_e = (_d = orderBook.loanTerms.fixed) === null || _d === void 0 ? void 0 : _d.terms.time) === null || _e === void 0 ? void 0 : _e.duration.toNumber(),
                        feePermillicentage: orderBook.feePermillicentage,
                        feeAuthority: orderBook.feeAuthority.toBase58(),
                        nftList: nftList || undefined,
                    });
                })));
                yield this.orderBookRepository.save(orderBookEntities);
            }
            this.logger.debug((0, date_fns_1.format)(new Date(), "'saveOrderBooks end:' MMMM d, yyyy hh:mma"));
            console.log((0, date_fns_1.format)(new Date(), "'saveOrderBooks end:' MMMM d, yyyy hh:mma"));
        });
    }
    saveNftList() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug((0, date_fns_1.format)(new Date(), "'saveNftList start:' MMMM d, yyyy hh:mma"));
            console.log((0, date_fns_1.format)(new Date(), "'saveNftList start:' MMMM d, yyyy hh:mma"));
            try {
                const { program } = sharkyClient_1.default;
                const currentNftList = yield this.nftListRepository.find();
                let newNftList = yield sharkyClient_1.default.fetchAllNftLists({ program });
                if (currentNftList.length > 0) {
                    newNftList = newNftList.filter((nftList) => currentNftList.find((n) => n.pubKey === nftList.pubKey.toBase58()) === undefined);
                }
                if (newNftList.length > 0) {
                    const collectionEntities = newNftList.map((collection) => {
                        return this.nftListRepository.create({
                            collectionName: collection.collectionName,
                            pubKey: collection.pubKey.toBase58(),
                            version: collection.version,
                            nftMint: collection.mints[collection.mints.length - 1].toBase58(),
                        });
                    });
                    yield this.nftListRepository.save(collectionEntities);
                }
            }
            catch (e) {
                console.log("ERROR", e);
            }
            this.logger.debug((0, date_fns_1.format)(new Date(), "'saveNftList end:' MMMM d, yyyy hh:mma"));
            console.log((0, date_fns_1.format)(new Date(), "'saveNftList end:' MMMM d, yyyy hh:mma"));
        });
    }
};
__decorate([
    (0, schedule_1.Interval)(300000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SharkifyService.prototype, "saveLoans", null);
__decorate([
    (0, schedule_1.Interval)(3600000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SharkifyService.prototype, "saveOrderBooks", null);
__decorate([
    (0, schedule_1.Interval)(3600000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SharkifyService.prototype, "saveNftList", null);
SharkifyService = SharkifyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(NftList_1.NftList)),
    __param(1, (0, typeorm_1.InjectRepository)(OrderBook_1.OrderBook)),
    __param(2, (0, typeorm_1.InjectRepository)(Loan_1.Loan)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SharkifyService);
exports.SharkifyService = SharkifyService;
//# sourceMappingURL=sharkify.service.js.map