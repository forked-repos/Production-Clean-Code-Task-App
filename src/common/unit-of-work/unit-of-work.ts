/**
 * Represents a consistent business transaction in which all parts must 
 * succeed lest the entire operation be aborted. 
 */
export interface IUnitOfWork {
    /** Commits a given business transaction. */
    commit(): Promise<void>;

    /** Rollsback a given business transaction. */
    rollback(): Promise<void>;
}

/**
 * Interface providing methods for the building of a Unit of Work.
 */
export interface IUnitOfWorkFactory {
    /** Creates a new Unit of Work. */
    create(): Promise<IUnitOfWork>;

    createUnderScope<T>(operation: (unitOfWork: IUnitOfWork) => Promise<T>): Promise<T>;
}

/**
 * Represents a repository that has the ability to re-instantiate itself bound
 * to an instance of a provided Unit of Work.
 */
export interface IUnitOfWorkCapable {
    /**
     * Provides a new instance of a repository bound to a Unit of Work.
     * @param unitOfWork The DB Transaction context.
     */
    forUnitOfWork(unitOfWork: IUnitOfWork): this;
}