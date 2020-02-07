import { ObjectSchema, ValidationError } from '@hapi/joi';

import { ValidatorErrorMessage } from './../../../common/operations/validation/validation';
import { Either, left, right } from './../../logic/Either';

type ValidateJoi = <TCandidate>(schema: ObjectSchema, candidate: TCandidate) => Either<ValidatorErrorMessage, TCandidate>;

/**
 * Validates a given candidate against its schema, returning an Either Monad result.
 * @param schema    A Joi Schema to validate the `candidate` against.
 * @param candidate A candidate object to validate against the `schema`.
 */
export const validate: ValidateJoi = <TCandidate>(schema: ObjectSchema, candidate: TCandidate): Either<ValidatorErrorMessage, TCandidate> => {
    const { error, value } = schema.validate(candidate);

    if (error) {
        return left((error as ValidationError).message);
    } else {
        return right(value);
    }
}