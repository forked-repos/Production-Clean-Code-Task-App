import { Request, Response, NextFunction } from 'express';
import { IAuthenticationService } from './../../../features/auth/services/AuthenticationService';
import { IUserRepository } from './../../../features/users/repositories/UserRepository';
import { AuthorizationErrors } from '../../../features/auth/errors/errors';
import { CommonErrors, ApplicationErrors } from '../../errors/errors';
import { TokenErrors } from '../../operations/tokens/errors/errors';


export const verifyAuthProvider = (
    authService: IAuthenticationService,
    userRepository: IUserRepository
) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.token) 
            throw AuthorizationErrors.AuthorizationError.create();

        const decodedTokenResult = authService.verifyAndDecodeAuthToken(req.token);

        if (decodedTokenResult.isLeft())
            throw decodedTokenResult.value;

        const user = await userRepository.findUserById(decodedTokenResult.value.id);

        console.log('have a user')

        // Add to the IoC Container here.
        req.user = user;

        return next();
    } catch (e) {
        switch (e.constructor) {
            // Fall through. Cool.
            case CommonErrors.NotFoundError:
            case CommonErrors.ValidationError:
            case AuthorizationErrors.AuthorizationError:
                throw AuthorizationErrors.AuthorizationError.create();
            default:
                console.log(e)
                throw ApplicationErrors.UnexpectedError.create();
        }
    }
}