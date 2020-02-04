import { BaseErrors, IApplicationErrorPayload } from "../../../errors/errors";
import { dataOrDefault } from './../../../../utils/logic/dataOrDefault';

export namespace TokenErrors {
    export class CouldNotGenerateTokenError extends BaseErrors.ApplicationError {
        private constructor (payload: IApplicationErrorPayload) { super(payload); }

        public static create(message?: string): CouldNotGenerateTokenError  {
            return new CouldNotGenerateTokenError({
                message: dataOrDefault('Could not generate a token.', message),
            });
        }
    }

    export class CouldNotDecodeTokenError extends BaseErrors.ApplicationError {
        private constructor (payload: IApplicationErrorPayload) { super(payload); }

        public static create(message?: string): CouldNotDecodeTokenError  {
            return new CouldNotDecodeTokenError({
                message: dataOrDefault('Could not decode token.', message),
            });
        }
    }

    export class TokenExpiredError extends BaseErrors.ApplicationError {
        private constructor (payload: IApplicationErrorPayload, public readonly expiredAt: Date) { super(payload); }

        public static create(expiredAt: Date, message?: string): TokenExpiredError  {
            return new TokenExpiredError({
                message: dataOrDefault('The token is expired', message)
            }, expiredAt);
        }
    }
}