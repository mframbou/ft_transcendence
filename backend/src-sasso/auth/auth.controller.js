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
exports.AuthController = void 0;
/* eslint-disable prefer-const */
// Nest
var common_1 = require("@nestjs/common");
var redisStore = require("cache-manager-redis-store");
var node_fetch_1 = require("node-fetch");
var cache_manager_1 = require("cache-manager");
// Transcendence
var prisma_service_1 = require("../prisma/prisma.service");
var session_service_1 = require("../session/session.service");
var jwt_auth_guard_1 = require("./jwt-auth.guard");
var urlRedirect = "http://".concat(process.env.HOST, "/api/auth/middleware/");
var AuthController = /** @class */ (function () {
    function AuthController(prisma, jwt, authService, sessionService) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.authService = authService;
        this.sessionService = sessionService;
        this.prisma = new prisma_service_1.PrismaService();
        this.sessionService = new session_service_1.MySessionService((0, cache_manager_1.caching)({
            store: redisStore,
            host: 'rediStatus',
            port: 6379,
            ttl: 0
        }));
    }
    /////////////////////////
    ///   LOGIN & AUTH   ///
    ////////////////////////
    // https://api.intra.42.fr/apidoc/guides/web_application_flow
    AuthController.prototype.getAuthCode = function (query, res) {
        var _this = this;
        return (0, node_fetch_1["default"])('https://api.intra.42.fr/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                client_id: "".concat(process.env.CLIENT_ID),
                client_secret: "".concat(process.env.CLIENT_SECRET),
                code: query,
                redirect_uri: "".concat(urlRedirect)
            })
        })
            .then(function (response) { return response.json(); })
            .then(function (data) {
            _this.get_token(data.access_token, res);
        });
    };
    AuthController.prototype.get_token = function (token, res) {
        var _this = this;
        var first = false;
        try {
            return (0, node_fetch_1["default"])('https://api.intra.42.fr/v2/me', {
                method: 'GET',
                headers: { Authorization: "Bearer ".concat(token) }
            })
                .then(function (response) { return response.json(); })
                .then(function (jsonData) {
                var ret = {
                    idIntra: jsonData.login,
                    userName: "".concat(jsonData.login, "_").concat(String(Date.now())),
                    firstName: jsonData.first_name,
                    lastName: jsonData.last_name,
                    img: jsonData.image_url,
                    campus: jsonData.campus[0].name
                };
                return ret;
            })
                .then(function (ret) { return __awaiter(_this, void 0, void 0, function () {
                var user, e_1, session, jwt, jwt;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 4]);
                            return [4 /*yield*/, this.prisma.user.findUnique({
                                    where: { idIntra: ret.idIntra }
                                })];
                        case 1:
                            user = _a.sent();
                            return [3 /*break*/, 4];
                        case 2:
                            e_1 = _a.sent();
                            if (this.is_administrator(ret.idIntra))
                                ret.owner = true;
                            first = true;
                            return [4 /*yield*/, this.prisma.user.create({
                                    data: ret
                                })];
                        case 3:
                            user = _a.sent();
                            return [3 /*break*/, 4];
                        case 4: return [4 /*yield*/, this.sessionService.find_session(user.idIntra)];
                        case 5:
                            session = _a.sent();
                            if (!(session && session.status !== 'offline')) return [3 /*break*/, 6];
                            res.redirect('/login');
                            return [3 /*break*/, 11];
                        case 6:
                            if (!user.banned) return [3 /*break*/, 7];
                            res.redirect('/login');
                            return [3 /*break*/, 11];
                        case 7:
                            if (!(user.twoFa === true)) return [3 /*break*/, 9];
                            return [4 /*yield*/, this.jwt.signAsync({ id: user.idIntra })];
                        case 8:
                            jwt = _a.sent();
                            res.cookie('cookie2f', jwt, { httpOnly: true });
                            res.redirect("/2fa/".concat(user.id));
                            return [3 /*break*/, 11];
                        case 9: return [4 /*yield*/, this.jwt.signAsync({ id: user.idIntra })];
                        case 10:
                            jwt = _a.sent();
                            res.cookie('cockies', jwt, { httpOnly: true });
                            first ? res.redirect('/') : res.redirect('/login');
                            _a.label = 11;
                        case 11: return [2 /*return*/];
                    }
                });
            }); });
        }
        catch (e) {
            throw new common_1.HttpException("It didn't works " + e.message, common_1.HttpStatus.CONFLICT);
        }
    };
    // (it's my (= sspina) uid, it's okay but important to not leak the secrect)
    AuthController.prototype.authRedirect = function (res) {
        return res.redirect("https://api.intra.42.fr/oauth/authorize?client_id=9ff20d31a6e021e5a2010628c4c7bc1604fd35f5284b13662bdf431c3d77bbb8&redirect_uri=".concat(urlRedirect, "&response_type=code"));
    };
    AuthController.prototype.logout = function (res) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                res.clearCookie('cockies');
                res.redirect('/');
                return [2 /*return*/];
            });
        });
    };
    //////////////////
    /// TWO FACTOR ///
    //////////////////
    AuthController.prototype.start_two_factor = function (body) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.authService.start_two_factor(body.id)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AuthController.prototype.completed_two_factor = function (body) {
        return __awaiter(this, void 0, void 0, function () {
            var a;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.authService.completed_two_factor(body)];
                    case 1:
                        a = _a.sent();
                        return [2 /*return*/, { QRcode: a }];
                }
            });
        });
    };
    AuthController.prototype.check_two_factor = function (body, res) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.authService.check_two_factor(body, res).then(function (e) {
                    e ? res.redirect('/login') : res.redirect('/login');
                    return e;
                });
                return [2 /*return*/];
            });
        });
    };
    //////////////////
    ///   UTILITY  ///
    //////////////////
    AuthController.prototype.user = function (req) {
        return __awaiter(this, void 0, void 0, function () {
            var data, user, _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.jwt.verifyAsync(req.cookies['cockies'])];
                    case 1:
                        data = _b.sent();
                        return [4 /*yield*/, this.prisma.user.findUnique({
                                where: {
                                    idIntra: data['id']
                                },
                                include: {
                                    badge: true,
                                    chat: true,
                                    admin: true,
                                    participant: true,
                                    userFriends: true,
                                    blocked: true,
                                    blockedBy: true,
                                    moderators: true
                                }
                            })];
                    case 2:
                        user = _b.sent();
                        _a = user;
                        return [4 /*yield*/, Promise.all(user.userFriends.map(function (friend) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.prisma.user.findUnique({
                                                where: {
                                                    idIntra: friend.friendId
                                                },
                                                select: {
                                                    email: true,
                                                    tel: true,
                                                    img: true,
                                                    firstName: true,
                                                    lastName: true,
                                                    userName: true,
                                                    idIntra: true,
                                                    campus: true,
                                                    win: true,
                                                    loses: true,
                                                    rank: true,
                                                    badge: true
                                                }
                                            })];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); }))];
                    case 3:
                        _a.userFriends = _b.sent();
                        return [2 /*return*/, user];
                }
            });
        });
    };
    AuthController.prototype.is_administrator = function (idIntra) {
        return (idIntra === 'mframbou' ||
            idIntra === 'dsamain' ||
            idIntra === 'oronda' ||
            idIntra === 'sspina');
    };
    __decorate([
        (0, common_1.Get)('middleware'),
        __param(0, (0, common_1.Query)('code')),
        __param(1, (0, common_1.Res)())
    ], AuthController.prototype, "getAuthCode");
    __decorate([
        __param(1, (0, common_1.Res)())
    ], AuthController.prototype, "get_token");
    __decorate([
        (0, common_1.Get)(),
        __param(0, (0, common_1.Res)())
    ], AuthController.prototype, "authRedirect");
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
        (0, common_1.Get)('/logout'),
        __param(0, (0, common_1.Res)())
    ], AuthController.prototype, "logout");
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
        (0, common_1.Post)('start_two_factor'),
        __param(0, (0, common_1.Body)())
    ], AuthController.prototype, "start_two_factor");
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
        (0, common_1.Post)('2fa'),
        __param(0, (0, common_1.Body)())
    ], AuthController.prototype, "completed_two_factor");
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
        (0, common_1.Post)('check_two_factor'),
        __param(0, (0, common_1.Body)()),
        __param(1, (0, common_1.Res)())
    ], AuthController.prototype, "check_two_factor");
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
        (0, common_1.Get)('/user'),
        __param(0, (0, common_1.Req)())
    ], AuthController.prototype, "user");
    AuthController = __decorate([
        (0, common_1.Controller)('auth')
    ], AuthController);
    return AuthController;
}());
exports.AuthController = AuthController;
