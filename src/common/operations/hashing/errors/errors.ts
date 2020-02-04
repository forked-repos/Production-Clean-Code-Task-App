import { BaseErrors, IApplicationErrorPayload } from './../../../errors/errors';

import { dataOrDefault } from './../../../../utils/logic/dataOrDefault';

export namespace HashingErrors {
    export class CouldNotGenerateSaltError extends BaseErrors.ApplicationError {
        private constructor (payload: IApplicationErrorPayload) { super(payload); }

        public static create(message?: string): CouldNotGenerateSaltError  {
            return new CouldNotGenerateSaltError({
                message: dataOrDefault('Could not generate a salt.', message),
            });
        }
    }

    export class CouldNotHashDataError extends BaseErrors.ApplicationError {
        private constructor (payload: IApplicationErrorPayload) { super(payload); }

        public static create(message?: string): CouldNotHashDataError  {
            return new CouldNotHashDataError({
                message: dataOrDefault('Could not hash the provided data.', message)
            });
        }
    }

    export class CouldNotCompareHashesError extends BaseErrors.ApplicationError {
        private constructor (payload: IApplicationErrorPayload) { super(payload); }

        public static create(message?: string): CouldNotCompareHashesError   {
            return new CouldNotCompareHashesError({
                message: dataOrDefault('Could not compare the provided hashes.', message)
            });
        }
    }
}