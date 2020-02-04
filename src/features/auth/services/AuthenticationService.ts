import { IHashHandler } from '../../../common/operations/hashing/adapters/HashingAdapter';

import { ITokenHandler, ITokenEncodingOptions, ITokenDecodingOptions } from './../../../common/operations/tokens/adapters/TokenAdapter';
import { TokenErrors } from './../../../common/operations/tokens/errors/errors';
import { AuthenticationErrors } from '../errors/errors';

export interface ITokenPayload {
    id: string;
}

export interface IAuthenticationService {
    /** Hashes a given password by the given rounds, which defaults to 12. */
    hashPassword(plainTextPassword: string, rounds?: number): Promise<string>;

    /** Checks that a candidate matches a hash. Returns `true` if so and `false` if not. */
    checkHashMatch(candidate: string, hash: string): Promise<boolean>;

    /** Generates an auth token with the specified payload and options. */
    generateAuthToken(payload: ITokenPayload, opts?: ITokenEncodingOptions): Promise<string>;

    /** Verifies that a token is valid, returns the payload response. */
    verifyAndDecodeAuthToken(token: string, opts?: ITokenDecodingOptions): Promise<ITokenPayload>;
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
            const hash = await this.hashHandler.generateHash(plainTextPassword, salt);
            return hash;
        } catch (e) {
            throw new Error('Unrecoverable');
        }
    }

    public async checkHashMatch(candidate: string, hash: string): Promise<boolean> {
        try {
            const isMatch = await this.hashHandler.compareAgainstHash(candidate, hash);
            return isMatch;
        } catch (e) {
            throw new Error('Unrecoverable');
        }
    }

    public async generateAuthToken(payload: ITokenPayload, opts?: ITokenEncodingOptions): Promise<string> {
        try {
            const token = await this.tokenHandler.generateToken(payload, 'my-secret', opts)
            return token;
        } catch (e) {
            throw new Error('Unrecoverable');
        }
    }
    
    public async verifyAndDecodeAuthToken(candidateToken: string, opts?: ITokenDecodingOptions): Promise<ITokenPayload> {
        try {
            const decoded = await this.tokenHandler.verifyAndDecodeToken(candidateToken, 'my-secret', opts);
            return decoded as ITokenPayload;
        } catch (e) {
            if (e instanceof TokenErrors.CouldNotDecodeTokenError)
                throw new Error('Unrecoverable');

            throw AuthenticationErrors.AuthorizationError.create();
        }
    }
}