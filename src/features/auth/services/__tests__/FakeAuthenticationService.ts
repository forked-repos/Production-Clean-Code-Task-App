import { IAuthenticationService, AuthType } from "../AuthenticationService";

import { ITokenPayload } from './../AuthenticationService';
import { ITokenEncodingOptions, ITokenDecodingOptions } from './../../../../common/operations/tokens/adapters/JwtAdapter';

import { Either, left, right } from "../../../../utils/logic/Either";
import { AuthorizationErrors } from "../../errors/errors";

import AuthenticationService from './../AuthenticationService';
import JwtAdapter from './../../../../common/operations/tokens/adapters/JwtAdapter';
import jsonwebtoken from 'jsonwebtoken';
import { IHashHandler } from './../../../../common/operations/hashing/adapters/BcryptAdapter';

interface IFakeAuthenticationService {
    didHash(password: string): boolean;
}

export class FakeAuthenticationService implements IAuthenticationService, IFakeAuthenticationService {
    private readonly hashes = new Map<string, string>();
    private readonly realAuthService = new AuthenticationService({} as IHashHandler, new JwtAdapter(jsonwebtoken))

    public readonly hash = '$123-ABC';

    hashPassword(plainTextPassword: string, rounds?: number): Promise<string> {
        this.hashes.set(plainTextPassword, this.hash);
        return Promise.resolve(this.hash);
    }    
    
    checkHashMatch(candidate: string, hash: string): Promise<boolean> {
        return Promise.resolve(candidate === hash);
    }

    generateAuthToken(payload: ITokenPayload, authType?: AuthType): string {
       return this.realAuthService.generateAuthToken(payload, authType);
    }

    verifyAndDecodeAuthToken(
        candidateToken: string, 
        opts?: ITokenDecodingOptions
    ): Either<AuthorizationErrors.AuthorizationError, ITokenPayload> {
        return this.realAuthService.verifyAndDecodeAuthToken(candidateToken, opts);
    }  
    
    didHash(password: string): boolean {
        return this.hashes.has(password);
    }
}
