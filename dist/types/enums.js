"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortOrder = exports.LoanType = exports.LoanSortType = exports.OrderBookSortType = void 0;
var OrderBookSortType;
(function (OrderBookSortType) {
    OrderBookSortType["Collection"] = "Collection";
    OrderBookSortType["TotalPool"] = "Total Pool";
    OrderBookSortType["BestOffer"] = "Best Offer";
    OrderBookSortType["Apy"] = "APY";
    OrderBookSortType["Duration"] = "Duration";
})(OrderBookSortType = exports.OrderBookSortType || (exports.OrderBookSortType = {}));
var LoanSortType;
(function (LoanSortType) {
    LoanSortType["Time"] = "time";
    LoanSortType["Amount"] = "amount";
})(LoanSortType = exports.LoanSortType || (exports.LoanSortType = {}));
var LoanType;
(function (LoanType) {
    LoanType["Offer"] = "offered";
    LoanType["Taken"] = "taken";
})(LoanType = exports.LoanType || (exports.LoanType = {}));
var SortOrder;
(function (SortOrder) {
    SortOrder["Asc"] = "ASC";
    SortOrder["Desc"] = "DESC";
})(SortOrder = exports.SortOrder || (exports.SortOrder = {}));
//# sourceMappingURL=enums.js.map