import { Request, Response, NextFunction } from 'express';

/**
 * Strips an Authorization Bearer token from the header of an incoming HTTP Request.
 */
export const stripBearerToken = (req: Request, res: Response, next: NextFunction): void => {
    const bearerToken: string | undefined = req.header('Authorization');

    if (bearerToken) {
        req.token = bearerToken.replace('Bearer ', '')
        return next();
    } else {
        req.token = '';
        return next();
    }
}