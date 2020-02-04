import { BaseErrors, IApplicationErrorPayload } from './../../../common/errors/errors';
import { dataOrDefault } from './../../../utils/logic/dataOrDefault';

export namespace AuthenticationErrors {
    export class InvalidTokenError extends BaseErrors.ApplicationError {
        private constructor (payload: IApplicationErrorPayload) { super(payload); }

        public static create(message?: string): InvalidTokenError {
            return new InvalidTokenError({
                message: dataOrDefault('The provided token was invalid.', message),
            });
        }
    }

    export class AuthorizationError extends BaseErrors.ApplicationError {
        private constructor (payload: IApplicationErrorPayload) { super(payload); }

        public static create(message?: string): AuthorizationError {
            return new AuthorizationError({
                message: dataOrDefault('Please authenticate. Request denied.', message),
            });
        }
    }
}