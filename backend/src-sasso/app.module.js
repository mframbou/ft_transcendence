"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AppModule = void 0;
// Nest
var common_1 = require("@nestjs/common");
var redisStore = require("cache-manager-redis-store");
// Transcendence
var app_controller_1 = require("./app.controller");
var app_service_1 = require("./app.service");
var prisma_module_1 = require("./prisma/prisma.module");
var auth_module_1 = require("./auth/auth.module");
var auth_service_1 = require("./auth/auth.service");
var auth_controller_1 = require("./auth/auth.controller");
var user_service_1 = require("./user/user.service");
var user_module_1 = require("./user/user.module");
var session_module_1 = require("./session/session.module");
var session_service_1 = require("./session/session.service");
var permission_module_1 = require("./permission/permission.module");
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        (0, common_1.Module)({
            controllers: [app_controller_1.AppController, auth_controller_1.AuthController],
            imports: [
                prisma_module_1.PrismaModule,
                auth_module_1.AuthModule,
                user_module_1.UserModule,
                session_module_1.SessionModule,
                permission_module_1.PermissionModule,
                common_1.CacheModule.register({
                    store: redisStore,
                    host: 'rediStatus',
                    port: 6379
                }),
            ],
            providers: [app_service_1.AppService, session_service_1.MySessionService, auth_service_1.AuthService, user_service_1.UserService]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
