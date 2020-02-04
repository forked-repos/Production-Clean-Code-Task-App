import { dataOrDefault } from './../../utils/logic/dataOrDefault';

/**
 * Information allowed to be serialized in a client readable error.
 */
export interface ISerializedClientSafeError {
    errorCode: string;
    domain: string;
    reason: string;
    message: string;
}

/**
 * Permits an error to be serializable to a client-understandable representation.
 */
export interface ISerializableToClientSafeError {
    serializeError(): ISerializedClientSafeError;
}

/**
 * The information payload for domain errors.
 */
export interface IDomainErrorPayload {
    errorCode: string;
    domain?: string;
    message: string;
}

/**
 * Properties that exist on a domain error.
 */
export interface IDomainError {
    errorCausationReason: ErrorCausationReason;
}

/**
 * Different reasons that may have led to the error. 
 * For mapping purposes.
 */
export enum ErrorCausationReason {
    DATA_NON_EXISTENT,
    BAD_DATA_PROVIDED,
    UNRECOVERABLE_FAILURE,
    UNKNOWN_ERROR
}

/**
 * The information payload application errors.
 */
export interface IApplicationErrorPayload {
    message: string;
}

// I suppose this is somewhat of a "naive" approach.
/**
 * Maps error types to error codes.
 */
export enum ErrorCode {
    VALIDATION_ERROR = 'Common-EVAL-001',
    NOT_FOUND_ERROR = 'NFE-001',
    UNEXPECTED_ERROR = 'Application-EUnexpected',
    AUTHORIZATION_ERROR = 'Authorization-EAuthorization-001',
}

export namespace BaseErrors {
    export class BaseError extends Error {
        public constructor(message: string) {
            super(message);

            this.message = message;
            this.name = this.constructor.name;

            Error.call(this);
            Error.captureStackTrace(this, this.constructor);

            Object.setPrototypeOf(this, new.target.prototype);
        }
    }

    export abstract class DomainError extends BaseError implements IDomainError, ISerializableToClientSafeError {
        public constructor (private readonly payload: IDomainErrorPayload) {
            super(payload.message);
        }

        public serializeError(): ISerializedClientSafeError {
            return {
                errorCode: this.payload.errorCode,
                domain: dataOrDefault('Unknown', this.payload.domain),
                reason: this.constructor.name,
                message: this.payload.message
            };
        }

        public abstract get errorCausationReason(): ErrorCausationReason;    
    }

    export class ApplicationError extends BaseError {
        public constructor (private readonly payload: IApplicationErrorPayload) {
            super(payload.message);
        }
    }
}

export namespace CommonErrors {
    export class ValidationError extends BaseErrors.DomainError {
        private constructor (payload: IDomainErrorPayload) { super(payload); }

        public static create(domain?: string, message?: string): ValidationError {
            return new ValidationError({
                errorCode: ErrorCode.VALIDATION_ERROR,
                domain,
                message: dataOrDefault('Validation failed for the requested operation.', message)
            });
        }

        public get errorCausationReason() { return ErrorCausationReason.BAD_DATA_PROVIDED; }
    }

    export class NotFoundError extends BaseErrors.DomainError {
        private constructor (payload: IDomainErrorPayload) { super(payload); }

        public static create(domain?: string, message?: string): NotFoundError {
            return new NotFoundError({
                errorCode: ErrorCode.NOT_FOUND_ERROR,
                domain,
                message: dataOrDefault('The requested resource could not be found.', message),
            });
        }

        public get errorCausationReason() { return ErrorCausationReason.DATA_NON_EXISTENT; }
    }
}

export namespace ApplicationErrors {
    export class UnexpectedError extends BaseErrors.DomainError {
        private constructor (payload: IDomainErrorPayload) { super(payload); }

        public static create(domain?: string, message?: string): UnexpectedError {
            return new UnexpectedError({
                errorCode: ErrorCode.UNEXPECTED_ERROR,
                domain, 
                message: dataOrDefault('An unexpected error has occurred.', message)
            });
        }

        public get errorCausationReason() { return ErrorCausationReason.UNKNOWN_ERROR; }
    }
}