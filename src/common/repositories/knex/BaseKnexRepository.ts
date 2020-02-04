import { ApplicationErrors } from "../../errors/errors";

/**
 * Interface providing helper methods for Knex Repositories.
 */
export interface IBaseKnexRepository {
    /**
     * Wraps a single DAL Operation and throws wrapped, domain-ready and persistence-agnostic
     * exceptions, such as retry-able Transient Exceptions.
     * 
     * @param dalOperation An operation upon the persistence technology.
     */
    handleErrors<T>(dalOperation: () => Promise<T>): Promise<T>;
}

/**
 * Helper methods for Knex Repositories.
 */
export class BaseKnexRepository implements IBaseKnexRepository {
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