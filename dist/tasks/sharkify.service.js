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
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("../constants");
let SharkifyService = SharkifyService_1 = class SharkifyService {
    constructor(nftListRepository, orderBookRepository, loanRepository) {
        this.nftListRepository = nftListRepository;
        this.orderBookRepository = orderBookRepository;
        this.loanRepository = loanRepository;
        this.logger = new common_1.Logger(SharkifyService_1.name);
    }
    saveLoans() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug((0, date_fns_1.format)(new Date(), "'saveLoans start:' MMMM d, yyyy hh:mma"));
            console.log((0, date_fns_1.format)(new Date(), "'saveLoans start:' MMMM d, yyyy hh:mma"));
            const { program } = sharkyClient_1.default;
            let newLoans = yield sharkyClient_1.default.fetchAllLoans({ program });
            let newLoansPubKeys = newLoans.map((loan) => loan.pubKey.toBase58());
            yield this.loanRepository.delete({ pubKey: (0, typeorm_2.Not)((0, typeorm_2.In)(newLoansPubKeys)) });
            const existingLoans = yield this.loanRepository.find({ where: { pubKey: (0, typeorm_2.In)(newLoansPubKeys) } });
            const existingLoansByPubKey = existingLoans.reduce((accumulator, loan) => {
                accumulator[loan.pubKey] = loan;
                return accumulator;
            }, {});
            const existingLoansPubKeys = new Set(existingLoans.map((loan) => loan.pubKey));
            const newlyAddedLoans = [];
            const updatedLoanEntities = [];
            for (const newLoan of newLoans) {
                if (!existingLoansPubKeys.has(newLoan.pubKey.toBase58())) {
                    newlyAddedLoans.push(newLoan);
                }
                else {
                    const newLoanPubKey = newLoan.pubKey.toBase58();
                    const savedLoan = existingLoansByPubKey[newLoanPubKey];
                    if (savedLoan) {
                        if (savedLoan.state !== newLoan.state) {
                            savedLoan.lenderWallet = (_a = newLoan.data.loanState.offer) === null || _a === void 0 ? void 0 : _a.offer.lenderWallet.toBase58();
                            savedLoan.offerTime = (_c = (_b = newLoan.data.loanState.offer) === null || _b === void 0 ? void 0 : _b.offer.offerTime) === null || _c === void 0 ? void 0 : _c.toNumber();
                            savedLoan.nftCollateralMint = (_d = newLoan.data.loanState.taken) === null || _d === void 0 ? void 0 : _d.taken.nftCollateralMint.toBase58();
                            savedLoan.lenderNoteMint = (_e = newLoan.data.loanState.taken) === null || _e === void 0 ? void 0 : _e.taken.lenderNoteMint.toBase58();
                            savedLoan.borrowerNoteMint = (_f = newLoan.data.loanState.taken) === null || _f === void 0 ? void 0 : _f.taken.borrowerNoteMint.toBase58();
                            savedLoan.apy = (_h = (_g = newLoan.data.loanState.taken) === null || _g === void 0 ? void 0 : _g.taken.apy.fixed) === null || _h === void 0 ? void 0 : _h.apy;
                            savedLoan.start = (_l = (_k = (_j = newLoan.data.loanState.taken) === null || _j === void 0 ? void 0 : _j.taken.terms.time) === null || _k === void 0 ? void 0 : _k.start) === null || _l === void 0 ? void 0 : _l.toNumber();
                            savedLoan.totalOwedLamports = (_p = (_o = (_m = newLoan.data.loanState.taken) === null || _m === void 0 ? void 0 : _m.taken.terms.time) === null || _o === void 0 ? void 0 : _o.totalOwedLamports) === null || _p === void 0 ? void 0 : _p.toNumber();
                            savedLoan.state = newLoan.state;
                            updatedLoanEntities.push(savedLoan);
                        }
                    }
                }
            }
            const newlyAddedLoansOrderBookPubKeys = newlyAddedLoans.map((loan) => loan.data.orderBook.toBase58());
            const uniqueOrderBookPubKeys = newlyAddedLoansOrderBookPubKeys.filter((value, index, self) => {
                return self.indexOf(value) === index;
            });
            if (newlyAddedLoans.length > 0) {
                const orderBooks = yield this.orderBookRepository.find({ where: { pubKey: (0, typeorm_2.In)(uniqueOrderBookPubKeys) } });
                const newLoanEntities = newlyAddedLoans.map((loan) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
                    const orderBook = orderBooks.find((orderBook) => loan.data.orderBook.toBase58() === orderBook.pubKey);
                    return this.loanRepository.create({
                        pubKey: loan.pubKey.toBase58(),
                        version: loan.data.version,
                        principalLamports: loan.data.principalLamports.toNumber(),
                        valueTokenMint: loan.data.valueTokenMint.toBase58(),
                        supportsFreezingCollateral: loan.supportsFreezingCollateral,
                        isCollateralFrozen: loan.isCollateralFrozen,
                        isHistorical: loan.isHistorical,
                        isForeclosable: loan.isForeclosable('mainnet'),
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
                        orderBook: orderBook,
                    });
                });
                yield this.loanRepository.save([...newLoanEntities, ...updatedLoanEntities], { chunk: Math.ceil((newLoanEntities.length + updatedLoanEntities.length) / 10) });
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
            let newOrderBooks = yield sharkyClient_1.default.fetchAllOrderBooks({ program });
            let newOrderBooksPubKeys = newOrderBooks.map((orderBook) => orderBook.pubKey.toBase58());
            yield this.orderBookRepository.delete({ pubKey: (0, typeorm_2.Not)((0, typeorm_2.In)(newOrderBooksPubKeys)) });
            const existingOrderBooks = yield this.orderBookRepository.find({ where: { pubKey: (0, typeorm_2.In)(newOrderBooksPubKeys) } });
            const existingOrderBooksPubKeys = new Set(existingOrderBooks.map((orderBook) => orderBook.pubKey));
            const newlyAddedOrderBooks = [];
            for (const newOrderBook of newOrderBooks) {
                if (!existingOrderBooksPubKeys.has(newOrderBook.pubKey.toBase58())) {
                    newlyAddedOrderBooks.push(newOrderBook);
                }
            }
            if (newlyAddedOrderBooks.length > 0) {
                const orderBookEntities = yield Promise.all(newlyAddedOrderBooks.map((orderBook) => __awaiter(this, void 0, void 0, function* () {
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
                let newNftLists = yield sharkyClient_1.default.fetchAllNftLists({ program });
                let newNftListPubKeys = newNftLists.map((nftList) => nftList.pubKey.toBase58());
                yield this.nftListRepository.delete({ pubKey: (0, typeorm_2.Not)((0, typeorm_2.In)(newNftListPubKeys)) });
                const existingNftList = yield this.nftListRepository.find({ where: { pubKey: (0, typeorm_2.In)(newNftListPubKeys) } });
                const existingNftListPubKeys = new Set(existingNftList.map((nftList) => nftList.pubKey));
                const newlyAddedNftLists = [];
                for (const newNftList of newNftLists) {
                    if (!existingNftListPubKeys.has(newNftList.pubKey.toBase58())) {
                        newlyAddedNftLists.push(newNftList);
                    }
                }
                if (newlyAddedNftLists.length > 0) {
                    const nftListEntities = newlyAddedNftLists.map((nftList) => {
                        return this.nftListRepository.create({
                            collectionName: nftList.collectionName,
                            pubKey: nftList.pubKey.toBase58(),
                            version: nftList.version,
                            nftMint: nftList.mints[nftList.mints.length - 1].toBase58(),
                        });
                    });
                    yield this.nftListRepository.save(nftListEntities);
                }
            }
            catch (e) {
                console.log('ERROR', e);
            }
            this.logger.debug((0, date_fns_1.format)(new Date(), "'saveNftList end:' MMMM d, yyyy hh:mma"));
            console.log((0, date_fns_1.format)(new Date(), "'saveNftList end:' MMMM d, yyyy hh:mma"));
        });
    }
    saveNftListImages() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug((0, date_fns_1.format)(new Date(), "'saveNftListImages start:' MMMM d, yyyy hh:mma"));
            console.log((0, date_fns_1.format)(new Date(), "'saveNftListImages start:' MMMM d, yyyy hh:mma"));
            try {
                const nftLists = yield this.nftListRepository.find({ where: { collectionImage: (0, typeorm_2.IsNull)() } });
                const imagePromises = nftLists.map((nftList) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c, _d;
                    const { data: mintInfo } = yield axios_1.default.post(`${constants_1.HELLO_MOON_URL}/nft/mint_information`, {
                        nftMint: nftList === null || nftList === void 0 ? void 0 : nftList.nftMint,
                    }, constants_1.AXIOS_CONFIG_HELLO_MOON_KEY);
                    const nftMint = (_a = mintInfo === null || mintInfo === void 0 ? void 0 : mintInfo.data[0]) === null || _a === void 0 ? void 0 : _a.nftCollectionMint;
                    if (nftMint) {
                        const { data: metadata } = yield axios_1.default.get(`${constants_1.SHYFT_URL}/nft/read?network=mainnet-beta&token_address=${nftMint}`, constants_1.AXIOS_CONFIG_SHYFT_KEY);
                        nftList.collectionImage = (_c = (_b = metadata === null || metadata === void 0 ? void 0 : metadata.result) === null || _b === void 0 ? void 0 : _b.cached_image_uri) !== null && _c !== void 0 ? _c : (_d = metadata === null || metadata === void 0 ? void 0 : metadata.result) === null || _d === void 0 ? void 0 : _d.image_uri;
                    }
                    return Promise.resolve();
                }));
                yield Promise.allSettled(imagePromises);
                yield this.nftListRepository.save(nftLists);
            }
            catch (e) {
                console.log('ERROR', e);
            }
            this.logger.debug((0, date_fns_1.format)(new Date(), "'saveNftListImages end:' MMMM d, yyyy hh:mma"));
            console.log((0, date_fns_1.format)(new Date(), "'saveNftListImages end:' MMMM d, yyyy hh:mma"));
        });
    }
    saveNftListFloorPrices() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug((0, date_fns_1.format)(new Date(), "'saveNftListPrices start:' MMMM d, yyyy hh:mma"));
            console.log((0, date_fns_1.format)(new Date(), "'saveNftListPrices start:' MMMM d, yyyy hh:mma"));
            const fetchHelloMoonCollectionIds = (addresses, paginationToken) => __awaiter(this, void 0, void 0, function* () {
                const { data: collectionIdResponse } = yield axios_1.default.post(`${constants_1.HELLO_MOON_URL}/nft/collection/mints`, {
                    nftMint: addresses,
                    paginationToken,
                }, constants_1.AXIOS_CONFIG_HELLO_MOON_KEY);
                return collectionIdResponse;
            });
            const fetchFloorPrice = (id) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                const res = yield axios_1.default.post(`${constants_1.HELLO_MOON_URL}/nft/collection/floorprice`, {
                    helloMoonCollectionId: id,
                }, constants_1.AXIOS_CONFIG_HELLO_MOON_KEY);
                return ((_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.length) ? (_c = res === null || res === void 0 ? void 0 : res.data) === null || _c === void 0 ? void 0 : _c.data[0] : undefined;
            });
            try {
                const nftLists = yield this.nftListRepository.find();
                const nftMintToListMap = nftLists.reduce((map, nftList) => {
                    map[nftList.nftMint] = nftList;
                    return map;
                }, {});
                const { data: collectionIds, paginationToken } = yield fetchHelloMoonCollectionIds(nftLists.map((nftList) => nftList.nftMint));
                let allIds = [...collectionIds];
                let currentPaginationToken = paginationToken;
                while (currentPaginationToken) {
                    const { data: collectionIds, paginationToken } = yield fetchHelloMoonCollectionIds(nftLists.map((nftList) => nftList.nftMint), currentPaginationToken);
                    currentPaginationToken = paginationToken;
                    allIds = [...allIds, ...collectionIds];
                }
                const collectionIdToNftListMap = {};
                allIds === null || allIds === void 0 ? void 0 : allIds.forEach((data) => {
                    collectionIdToNftListMap[data.helloMoonCollectionId] = nftMintToListMap[data.nftMint];
                });
                console.log('collectionIds', allIds.length);
                const promises = allIds.map((id) => __awaiter(this, void 0, void 0, function* () {
                    var _d;
                    const { floorPriceLamports, helloMoonCollectionId } = (_d = (yield fetchFloorPrice(id.helloMoonCollectionId))) !== null && _d !== void 0 ? _d : {};
                    return { floorPriceLamports, helloMoonCollectionId };
                }));
                const floorPrices = yield Promise.all(promises);
                console.log('floorPrices', floorPrices.length);
                const nftListsToSave = [];
                for (const { floorPriceLamports, helloMoonCollectionId } of floorPrices) {
                    if (floorPriceLamports && helloMoonCollectionId) {
                        const nftList = collectionIdToNftListMap[helloMoonCollectionId];
                        nftList.floorPrice = floorPriceLamports;
                        nftListsToSave.push(nftList);
                    }
                }
                yield this.nftListRepository.save(nftListsToSave);
            }
            catch (e) {
                console.log('ERROR', e);
            }
            this.logger.debug((0, date_fns_1.format)(new Date(), "'saveNftListPrices end:' MMMM d, yyyy hh:mma"));
            console.log((0, date_fns_1.format)(new Date(), "'saveNftListPrices end:' MMMM d, yyyy hh:mma"));
        });
    }
};
__decorate([
    (0, schedule_1.Interval)(60000),
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
__decorate([
    (0, schedule_1.Interval)(3600000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SharkifyService.prototype, "saveNftListImages", null);
__decorate([
    (0, schedule_1.Interval)(300000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SharkifyService.prototype, "saveNftListFloorPrices", null);
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