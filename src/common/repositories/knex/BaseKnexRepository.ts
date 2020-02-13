import { ApplicationErrors } from "../../errors/errors";
import { IBaseRepository } from './../repository';

/**
 * Helper methods for Knex Repositories.
 */
export class BaseKnexRepository implements IBaseRepository {
    public async handleErrors<T>(dalOperation: () => Promise<T>): Promise<T> {
        try {
            return await dalOperation();
        } catch (err) {
            // Throw wrapped exceptions here.
            // Maybe log?
            console.error('base error', err);
            
            switch(err) {
                default:
                    // Log
                    throw ApplicationErrors.UnexpectedError.create();
            }
        }
    }
}