import { BaseErrors, IDomainErrorPayload, ErrorCode, ErrorCausationReason } from './../../../common/errors/errors';
import { dataOrDefault } from './../../../utils/logic/dataOrDefault';

export namespace AuthorizationErrors {
    export class AuthorizationError extends BaseErrors.DomainError {
        private constructor (payload: IDomainErrorPayload) { super(payload); }

        public static create(domain?: string, message?: string): AuthorizationError {
            return new AuthorizationError({
                errorCode: ErrorCode.AUTHORIZATION_ERROR,
                domain,
                message: dataOrDefault('You are not authorized to view this resource.', message),
            });
        }

        public get errorCausationReason() { return ErrorCausationReason.NOT_AUTHORIZED; }
    }
}