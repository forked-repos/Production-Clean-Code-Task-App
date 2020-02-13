import { IBaseRepository } from "../repository";
import { ApplicationErrors } from "../../errors/errors";

export class FakeBaseRepository implements IBaseRepository {
    public async handleErrors<T>(
        dalOperation: () => Promise<T>,
        errorCauser?: string,
    ): Promise<T> {
        switch (errorCauser) {
            case 'network-error':
                // Will make this more specific later.
                throw ApplicationErrors.UnexpectedError.create();
            default:
                return dalOperation();
        }
    }
}