"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.PermissionModule = void 0;
// Nest
var common_1 = require("@nestjs/common");
var jwt_1 = require("@nestjs/jwt");
var redisStore = require("cache-manager-redis-store");
// Transcendence
var permission_service_1 = require("./permission.service");
var permission_controller_1 = require("./permission.controller");
var prisma_service_1 = require("../prisma/prisma.service");
var prisma_module_1 = require("../prisma/prisma.module");
var auth_module_1 = require("../auth/auth.module");
var PermissionModule = /** @class */ (function () {
    function PermissionModule() {
    }
    PermissionModule = __decorate([
        (0, common_1.Module)({
            imports: [
                prisma_module_1.PrismaModule,
                auth_module_1.AuthModule,
                jwt_1.JwtModule.register({
                    secret: process.env.SECRET,
                    signOptions: { expiresIn: '1d' }
                }),
                common_1.CacheModule.register({
                    store: redisStore,
                    host: 'rediStatus',
                    port: 6379
                }),
            ],
            controllers: [permission_controller_1.PermissionController],
            providers: [permission_service_1.PermissionService, prisma_service_1.PrismaService],
            exports: [permission_service_1.PermissionService]
        })
    ], PermissionModule);
    return PermissionModule;
}());
exports.PermissionModule = PermissionModule;
