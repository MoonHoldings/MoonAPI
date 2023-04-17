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
exports.createSigninType = exports.hasSigninType = void 0;
const entities_1 = require("../entities");
const hasSigninType = (email, signinType) => __awaiter(void 0, void 0, void 0, function* () {
    const signupTypeObect = yield entities_1.SigninType.findOne({ where: { email, signinType } });
    if (!signupTypeObect) {
        return false;
    }
    return true;
});
exports.hasSigninType = hasSigninType;
const createSigninType = (email, signinType) => __awaiter(void 0, void 0, void 0, function* () {
    return yield entities_1.SigninType.save({ email, signinType });
});
exports.createSigninType = createSigninType;
//# sourceMappingURL=SigninType.js.map