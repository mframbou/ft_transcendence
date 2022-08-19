"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.UserController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
var error_dispatcher_1 = require("../error-dispatcher/error-dispatcher");
var UserController = /** @class */ (function () {
    function UserController(jwt, prisma, userService, permissionService) {
        this.jwt = jwt;
        this.prisma = prisma;
        this.userService = userService;
        this.permissionService = permissionService;
    }
    UserController.prototype.two_factore_activation = function (id, req) {
        return __awaiter(this, void 0, void 0, function () {
            var user, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { id: Number(id) }
                            })];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, this.permissionService.is_current_user(req, user.idIntra)];
                    case 2:
                        if (!_a.sent()) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.userService.two_factor_activate(Number(id))];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4: throw new common_1.HttpException('Not Authorized', common_1.HttpStatus.UNAUTHORIZED);
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        e_1 = _a.sent();
                        (0, error_dispatcher_1["default"])(e_1);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    UserController.prototype.two_factor_dectivation = function (idIntra, req) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, e_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, this.permissionService.is_administrator(req)];
                    case 1:
                        _a = (_b.sent());
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.permissionService.is_current_user(req, idIntra)];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3:
                        if (!_a) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.userService.two_factor_dectivation(idIntra)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: throw new common_1.HttpException('Not Authorized', common_1.HttpStatus.UNAUTHORIZED);
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        e_2 = _b.sent();
                        (0, error_dispatcher_1["default"])(e_2);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
        (0, common_1.Post)('activate/2fa/:id'),
        __param(0, (0, common_1.Param)('id')),
        __param(1, (0, common_1.Req)())
    ], UserController.prototype, "two_factore_activation");
    __decorate([
        (0, common_1.Post)('deactivate/2fa/:id'),
        __param(0, (0, common_1.Param)('id')),
        __param(1, (0, common_1.Req)())
    ], UserController.prototype, "two_factor_dectivation");
    UserController = __decorate([
        (0, common_1.Controller)('users')
    ], UserController);
    return UserController;
}());
exports.UserController = UserController;
