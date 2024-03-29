"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.SessionModule = void 0;
// Nest
var common_1 = require("@nestjs/common");
var redisStore = require("cache-manager-redis-store");
// Transcendence
var session_service_1 = require("./session.service");
var session_controller_1 = require("./session.controller");
var SessionModule = /** @class */ (function () {
    function SessionModule() {
    }
    SessionModule = __decorate([
        (0, common_1.Module)({
            imports: [
                common_1.CacheModule.register({
                    store: redisStore,
                    host: 'rediStatus',
                    port: 6379
                }),
            ],
            controllers: [session_controller_1.SessionController],
            providers: [session_service_1.MySessionService]
        })
    ], SessionModule);
    return SessionModule;
}());
exports.SessionModule = SessionModule;
