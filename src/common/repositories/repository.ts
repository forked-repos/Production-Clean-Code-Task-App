/**
 * Base methods for all repositories.
 */
export interface IRepository<T> {
    exists(t: T): Promise<boolean>;
    existsById(id: string): Promise<boolean>;

    /** Creates the next identity/ID for an entity. */
    nextIdentity(): string;
}

/**
 * Interface providing helper methods for Repositories.
 */
export interface IBaseRepository {
    /**
     * Wraps a single DAL Operation and throws wrapped, domain-ready and persistence-agnostic
     * exceptions, such as retry-able Transient Exceptions.
     * 
     * @param dalOperation An operation upon the persistence technology.
     */
    handleErrors<T>(dalOperation: () => Promise<T>): Promise<T>;
}