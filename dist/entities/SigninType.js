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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SigninType = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
let SigninType = class SigninType extends typeorm_1.BaseEntity {
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SigninType.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: false }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], SigninType.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: false }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], SigninType.prototype, "signinType", void 0);
SigninType = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)()
], SigninType);
exports.SigninType = SigninType;
//# sourceMappingURL=SigninType.js.map