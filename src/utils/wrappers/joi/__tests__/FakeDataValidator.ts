
import { IDataValidator } from './../../../../common/operations/validation/validation';
import { Either } from '../../../../utils/logic/Either';
import { validate } from './../joiWrapper';
import { ObjectSchema } from '@hapi/joi';
import { right } from './../../../logic/Either';

interface IFakeDataValidator {
    allowBadData(allow: boolean): void;
}

export class FakeDataValidator implements IDataValidator, IFakeDataValidator {
    private allowFailures: boolean = false;

    validate<U extends any, T>(schema: U, candidate: T): Either<string, T> {
        if (!this.allowFailures) {
            return validate(schema as unknown as ObjectSchema, candidate);
        } else {
            return right(candidate);
        }
    }

    allowBadData(allow: boolean) { this.allowFailures = allow; }
}