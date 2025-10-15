import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const APP_TOKEN = process.env.APP_TOKEN || '';

@Injectable()
export class AppTokenMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Pré-libera OPTIONS
    if (req.method === 'OPTIONS') return res.sendStatus(204);

    // Aceita token no body (POST/PUT/PATCH) e na query (GET/DELETE/HEAD)
    const tokenFromBody = (req.body && (req.body.token as string)) || '';
    const tokenFromQuery = (req.query?.token as string) || '';

    const token = tokenFromBody || tokenFromQuery;

    if (!token) {
      return res.status(401).json({ error: 'TOKEN_MISSING', message: 'Token é obrigatório.' });
    }
    if (token !== APP_TOKEN) {
      return res.status(403).json({ error: 'TOKEN_INVALID', message: 'Token inválido.' });
    }

    // Evita vazar token adiante
    if (req.body && 'token' in req.body) delete req.body.token;

    return next();
  }
}
