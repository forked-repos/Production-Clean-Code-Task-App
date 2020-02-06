import { IHashHandler } from '../../../common/operations/hashing/adapters/BcryptAdapter';
import { ITokenHandler, ITokenEncodingOptions, ITokenDecodingOptions } from '../../../common/operations/tokens/adapters/JwtAdapter';

import { TokenErrors } from './../../../common/operations/tokens/errors/errors';
import { AuthorizationErrors } from '../errors/errors';
import { ApplicationErrors } from '../../../common/errors/errors';

import { Either, right, left } from '../../../utils/logic/Either';

export interface ITokenPayload {
    id: string;
}

export interface IAuthenticationService {
    /** Hashes a given password by the given rounds, which defaults to 12. */
    hashPassword(plainTextPassword: string, rounds?: number): Promise<string>;

    /** Checks that a candidate matches a hash. Returns `true` if so and `false` if not. */
    checkHashMatch(candidate: string, hash: string): Promise<boolean>;

    /** Generates an auth token with the specified payload and options. */
    generateAuthToken(payload: ITokenPayload, opts?: ITokenEncodingOptions): string;

    /** Verifies that a token is valid, returns the payload response. */
    verifyAndDecodeAuthToken(token: string, opts?: ITokenDecodingOptions): Either<AuthorizationErrors.AuthorizationError, ITokenPayload>;
}

/**
 * Handles authentication and authorization-related operations pertaining to 
 * password hashing, password comparison, auth token generation, and auth token
 * verification.
 */
export default class AuthenticationService implements IAuthenticationService {
    public constructor (
        private readonly hashHandler: IHashHandler,
        private readonly tokenHandler: ITokenHandler
    ) {}

    public async hashPassword(plainTextPassword: string, rounds: number = 12): Promise<string> {
        try {
            const salt = await this.hashHandler.generateSalt(rounds);
            return await this.hashHandler.generateHash(plainTextPassword, salt);
        } catch (e) {
            return Promise.reject(ApplicationErrors.UnexpectedError.create());
        }
    }

    public async checkHashMatch(candidate: string, hash: string): Promise<boolean> {
        try {
            return await this.hashHandler.compareAgainstHash(candidate, hash);
        } catch (e) {
            return Promise.reject(ApplicationErrors.UnexpectedError.create());
        }
    }

    public generateAuthToken(payload: ITokenPayload, opts?: ITokenEncodingOptions): string {
        try {
            return this.tokenHandler.generateToken(payload, 'my-secret', opts)
        } catch (e) {
            throw ApplicationErrors.UnexpectedError.create();
        }
    }
    
    public verifyAndDecodeAuthToken(
        candidateToken: string, 
        opts?: ITokenDecodingOptions
    ): Either<AuthorizationErrors.AuthorizationError, ITokenPayload> {
        try {
            return right(this.tokenHandler.verifyAndDecodeToken(candidateToken, 'my-secret', opts) as ITokenPayload);
        } catch (e) {
            switch (true) {
                case e instanceof TokenErrors.CouldNotDecodeTokenError:
                    throw ApplicationErrors.UnexpectedError.create();
                case e instanceof TokenErrors.TokenExpiredError:
                    return left(AuthorizationErrors.AuthorizationError.create());
                default:
                    throw ApplicationErrors.UnexpectedError.create();
            }
        }
    }
}