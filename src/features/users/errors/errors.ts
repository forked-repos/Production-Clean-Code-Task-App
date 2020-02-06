import { BaseErrors } from "../../../common/errors/errors";
import { IDomainErrorPayload, ErrorCausationReason } from './../../../common/errors/errors';

export namespace CreateUserErrors {
    const domain = 'Users';

    export enum ErrorCode {
        USERNAME_TAKEN_ERROR = 'ERR_UNAME_TAKEN',
        EMAIL_TAKEN_ERROR = 'ERR_EMAIL_TAKEN'
    };

    export class UsernameTakenError extends BaseErrors.DomainError {
        private constructor(payload: IDomainErrorPayload) {
            super(payload);
        }

        public static create(): UsernameTakenError {
            return new UsernameTakenError({
                errorCode: ErrorCode.USERNAME_TAKEN_ERROR,
                domain,
                message: 'The provided username is already in use.'
            });
        }

        public get errorCausationReason() { return ErrorCausationReason.BAD_DATA_PROVIDED; }
    }

    export class EmailTakenError extends BaseErrors.DomainError {
        private constructor(payload: IDomainErrorPayload) {
            super(payload);
        }

        public static create(): EmailTakenError {
            return new EmailTakenError({
                errorCode: ErrorCode.EMAIL_TAKEN_ERROR,
                domain,
                message: 'The provided email address is already in use.'
            });
        }

        public get errorCausationReason() { return ErrorCausationReason.BAD_DATA_PROVIDED; }
    }
}