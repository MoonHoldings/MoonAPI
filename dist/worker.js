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
require("dotenv-safe/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const nest = yield core_1.NestFactory.create(app_module_1.AppModule);
    nest.listen(8001, () => {
        console.log("nest started at localhost:8001");
    });
});
main().catch((err) => {
    console.log(err);
});
//# sourceMappingURL=worker.js.map