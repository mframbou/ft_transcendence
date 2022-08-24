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
exports.__esModule = true;
exports.SessionController = void 0;
// Nest
var common_1 = require("@nestjs/common");
// Transcendence
var session_service_1 = require("./session.service");
var SessionController = /** @class */ (function () {
    function SessionController(SessionService, cacheManager) {
        this.SessionService = SessionService;
        this.cacheManager = cacheManager;
        this.SessionService = new session_service_1.MySessionService(this.cacheManager);
    }
    SessionController = __decorate([
        (0, common_1.Controller)('session'),
        __param(1, (0, common_1.Inject)(common_1.CACHE_MANAGER))
    ], SessionController);
    return SessionController;
}());
exports.SessionController = SessionController;
