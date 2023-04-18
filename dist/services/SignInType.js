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
exports.createSignInType = exports.hasSignInType = void 0;
const entities_1 = require("../entities");
const hasSignInType = (email, signInType) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield entities_1.User.findOne({ where: { email } });
    if (user) {
        const signInTypeObject = yield entities_1.SignInType.findOne({ where: { user: { id: user.id }, signInType: signInType } });
        if (!signInTypeObject) {
            return false;
        }
        return true;
    }
    else {
        return true;
    }
});
exports.hasSignInType = hasSignInType;
const createSignInType = (email, signInType) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield entities_1.User.findOne({ where: { email } });
    if (user)
        return yield entities_1.SignInType.save({ user, signInType });
    else
        return false;
});
exports.createSignInType = createSignInType;
//# sourceMappingURL=SignInType.js.map