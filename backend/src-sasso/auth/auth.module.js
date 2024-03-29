"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AuthModule = void 0;
// Nest
var common_1 = require("@nestjs/common");
var jwt_1 = require("@nestjs/jwt");
var redisStore = require("cache-manager-redis-store");
// Transcendence
var prisma_service_1 = require("../../src/prisma/prisma.service");
var session_service_1 = require("src/session/session.service");
var auth_controller_1 = require("./auth.controller");
var auth_service_1 = require("./auth.service");
var jwt_strategy_1 = require("./jwt.strategy");
var AuthModule = /** @class */ (function () {
    function AuthModule() {
    }
    AuthModule = __decorate([
        (0, common_1.Module)({
            imports: [
                jwt_1.JwtModule.register({
                    secret: process.env.SECRET,
                    signOptions: {
                        expiresIn: '1d'
                    }
                }),
                common_1.CacheModule.register({
                    store: redisStore,
                    host: 'rediStatus',
                    port: 6379
                }),
            ],
            controllers: [auth_controller_1.AuthController],
            providers: [auth_service_1.AuthService, prisma_service_1.PrismaService, jwt_strategy_1.JwtStrategy, session_service_1.MySessionService],
            exports: [jwt_1.JwtModule]
        })
    ], AuthModule);
    return AuthModule;
}());
exports.AuthModule = AuthModule;
