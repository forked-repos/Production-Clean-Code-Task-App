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
    useAsCurrentTimestamp?: string;
}

export interface ITokenHandler {
    generateToken(payload: Payload, secret?: string, opts?: ITokenEncodingOptions): string;
    verifyAndDecodeToken(candidateToken: string, secret: string, opts?: ITokenDecodingOptions): Payload;
}

export default class JwtAdapter implements ITokenHandler {
    public constructor(private readonly jwt: typeof jsonwebtoken) {}

    public generateToken(
        payload: Payload, 
        secret: string, 
        opts?: ITokenEncodingOptions
    ): string {
        try {
            return this.jwt.sign(payload, secret, opts as SignOptions);
        } catch (e) {
            throw TokenErrors.CouldNotGenerateTokenError.create(e.message);
        }
    }

    public verifyAndDecodeToken(
        candidateToken: string, 
        secret: string, 
        opts?: ITokenDecodingOptions
    ): Payload {
        try {
            return this.jwt.verify(candidateToken, secret, opts as VerifyOptions) as Payload;
        } catch (e) {
            if (e instanceof TokenExpiredError) 
                throw TokenErrors.TokenExpiredError.create(e.expiredAt, e.message);
            else 
                throw TokenErrors.InvalidTokenError.create(e.message);
        }
    }
}