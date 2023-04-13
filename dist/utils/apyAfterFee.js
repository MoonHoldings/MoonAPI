"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function apyAfterFee(apy, duration, feePermillicentage) {
    const aprBeforeFee = apy / 1000;
    const interestRatioBeforeFee = Math.exp((duration / (365 * 24 * 60 * 60)) * (aprBeforeFee / 100)) - 1;
    const interestRatioAfterFee = interestRatioBeforeFee * (1 - feePermillicentage / 100000);
    const aprAfterFee = (Math.log(1 + interestRatioAfterFee) / (duration / (365 * 24 * 60 * 60))) * 100;
    return Math.ceil(100 * (Math.exp(aprAfterFee / 100) - 1));
}
exports.default = apyAfterFee;
//# sourceMappingURL=apyAfterFee.js.map