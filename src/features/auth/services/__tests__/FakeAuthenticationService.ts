import { IAuthenticationService } from "../AuthenticationService";

import { ITokenPayload } from './../AuthenticationService';
import { ITokenEncodingOptions, ITokenDecodingOptions } from './../../../../common/operations/tokens/adapters/JwtAdapter';

import { Either, left, right } from "../../../../utils/logic/Either";
import { AuthorizationErrors } from "../../errors/errors";

interface IFakeAuthenticationService {
    didHash(password: string): boolean;
    didGenerateTokenForPayload(payload: ITokenPayload): boolean;
}

export class FakeAuthenticationService implements IAuthenticationService, IFakeAuthenticationService {
    private readonly hashes = new Map<string, string>();
    private readonly tokens = new Map<ITokenPayload, string>();

    public readonly hash = '$123-ABC';
    public readonly token = 'header.payload.alg';

    hashPassword(plainTextPassword: string, rounds?: number): Promise<string> {
        this.hashes.set(plainTextPassword, this.hash);
        return Promise.resolve(this.hash);
    }    
    
    checkHashMatch(candidate: string, hash: string): Promise<boolean> {
        return Promise.resolve(candidate === hash);
    }

    generateAuthToken(payload: ITokenPayload, opts?: ITokenEncodingOptions): string {
        this.tokens.set(payload, this.token);
        return this.token;
    }

    verifyAndDecodeAuthToken(
        candidateToken: string, 
        opts?: ITokenDecodingOptions
    ): Either<AuthorizationErrors.AuthorizationError, ITokenPayload> {
        for (let payload of this.tokens.keys()) {
            const token = this.tokens.get(payload);

            if (token === candidateToken) 
                return right(payload);
        }

        return left(AuthorizationErrors.AuthorizationError.create());
    }  
    
    didHash(password: string): boolean {
        return this.hashes.has(password);
    }

    didGenerateTokenForPayload(payload: ITokenPayload): boolean {
        let doesTokenExist: boolean = false;

        for (let existingPayload of this.tokens.keys()) {
            if (JSON.stringify(existingPayload) === JSON.stringify(payload))
                doesTokenExist = true;
        }

        return doesTokenExist;
    }
}
