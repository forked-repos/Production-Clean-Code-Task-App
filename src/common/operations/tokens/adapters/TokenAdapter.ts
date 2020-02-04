import jsonwebtoken, { SignOptions, VerifyOptions, TokenExpiredError } from 'jsonwebtoken';

import { TokenErrors } from '../errors/errors';

type Payload = object | string | Buffer;

export interface ITokenEncodingOptions {
    expiresIn?: number | string;
    issuer?: string;
}

export interface ITokenDecodingOptions {
    ignoreExpiration?: boolean;
    issuer?: string;
    useAsCurrentTimestamp: string;
}

export interface ITokenHandler {
    generateToken(payload: Payload, secret?: string, opts?: ITokenEncodingOptions): Promise<string>;
    verifyAndDecodeToken(candidateToken: string, secret: string, opts?: ITokenDecodingOptions): Promise<Payload>;
}

export default class JwtAdapter implements ITokenHandler {
    public constructor(private readonly jwt: typeof jsonwebtoken) {}

    public generateToken(
        payload: Payload, 
        secret: string, 
        opts?: ITokenEncodingOptions
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            this.jwt.sign(payload, secret, opts as SignOptions, (err: Error, token: string) => {
                if(err) return reject(TokenErrors.CouldNotGenerateTokenError.create(err.message));
                return resolve(token);
            });
        });
    }

    public verifyAndDecodeToken(
        candidateToken: string, 
        secret: string, 
        opts?: ITokenDecodingOptions
    ): Promise<Payload> {
        return new Promise((resolve, reject) => {
            this.jwt.verify(candidateToken, secret, opts as VerifyOptions, (err: Error, token: Payload) => {
                if (err) {
                    if (err instanceof TokenExpiredError) 
                        return reject(TokenErrors.TokenExpiredError.create(err.expiredAt, err.message));
                    else 
                        return reject(TokenErrors.CouldNotDecodeTokenError.create(err.message));
                }
                return resolve(token);
            });
        });
    }
}