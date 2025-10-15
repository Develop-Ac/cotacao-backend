"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppTokenMiddleware = void 0;
const common_1 = require("@nestjs/common");
const APP_TOKEN = process.env.APP_TOKEN || '';
let AppTokenMiddleware = class AppTokenMiddleware {
    use(req, res, next) {
        if (req.method === 'OPTIONS')
            return res.sendStatus(204);
        const tokenFromBody = (req.body && req.body.token) || '';
        const tokenFromQuery = req.query?.token || '';
        const token = tokenFromBody || tokenFromQuery;
        if (!token) {
            return res.status(401).json({ error: 'TOKEN_MISSING', message: 'Token é obrigatório.' });
        }
        if (token !== APP_TOKEN) {
            return res.status(403).json({ error: 'TOKEN_INVALID', message: 'Token inválido.' });
        }
        if (req.body && 'token' in req.body)
            delete req.body.token;
        return next();
    }
};
exports.AppTokenMiddleware = AppTokenMiddleware;
exports.AppTokenMiddleware = AppTokenMiddleware = __decorate([
    (0, common_1.Injectable)()
], AppTokenMiddleware);
//# sourceMappingURL=app-token.middleware.js.map