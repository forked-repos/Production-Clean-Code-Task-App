import { Either } from "../../../utils/logic/Either";

export type ValidatorErrorMessage = string;
export type Validator = <TObjectSchema, TCandidate>
    (schema: TObjectSchema, candidate: TCandidate) => Either<ValidatorErrorMessage, TCandidate>;

export interface IDataValidator {
    validate: Validator;
}
