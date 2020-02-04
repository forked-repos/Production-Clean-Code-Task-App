import { BaseErrors } from "../../../common/errors/errors";
import { IDomainErrorPayload, ErrorCausationReason } from './../../../common/errors/errors';
import { dataOrDefault } from './../../../utils/logic/dataOrDefault';

export namespace CreateUserErrors {
    enum ErrorCode {
        USERNAME_TAKEN_ERROR = 'ERR_UNAME_TAKEN',
        EMAIL_TAKEN_ERROR = 'ERR_EMAIL_TAKEN'
    };

    export class UsernameTakenError extends BaseErrors.DomainError {
        private constructor(payload: IDomainErrorPayload) {
            super(payload);
        }

        public static create(message?: string): UsernameTakenError {
            return new UsernameTakenError({
                errorCode: ErrorCode.USERNAME_TAKEN_ERROR,
                domain: 'Users',
                message: dataOrDefault('The provided username is already in use.', message)
            });
        }

        public get errorCausationReason() { return ErrorCausationReason.BAD_DATA_PROVIDED; }
    }

    export class EmailTakenError extends BaseErrors.DomainError {
        private constructor(payload: IDomainErrorPayload) {
            super(payload);
        }

        public static create(message?: string): EmailTakenError {
            return new EmailTakenError({
                errorCode: ErrorCode.EMAIL_TAKEN_ERROR,
                domain: 'Users',
                message: dataOrDefault('The provided email address is already in use.', message)
            });
        }

        public get errorCausationReason() { return ErrorCausationReason.BAD_DATA_PROVIDED; }
    }
}