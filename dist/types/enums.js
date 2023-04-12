"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortOrder = exports.LoanType = exports.OrderBookSortType = void 0;
var OrderBookSortType;
(function (OrderBookSortType) {
    OrderBookSortType["Collection"] = "Collection";
    OrderBookSortType["TotalPool"] = "Total Pool";
    OrderBookSortType["BestOffer"] = "Best Offer";
    OrderBookSortType["Apy"] = "APY";
    OrderBookSortType["Duration"] = "Duration";
})(OrderBookSortType = exports.OrderBookSortType || (exports.OrderBookSortType = {}));
var LoanType;
(function (LoanType) {
    LoanType["Offer"] = "offered";
    LoanType["Taken"] = "taken";
})(LoanType = exports.LoanType || (exports.LoanType = {}));
var SortOrder;
(function (SortOrder) {
    SortOrder["Asc"] = "asc";
    SortOrder["Desc"] = "desc";
})(SortOrder = exports.SortOrder || (exports.SortOrder = {}));
//# sourceMappingURL=enums.js.map