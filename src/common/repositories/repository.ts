/**
 * Base methods for all repositories.
 */
export interface IRepository<T> {
    exists(t: T): Promise<boolean>;
    existsById(id: number): Promise<boolean>;
}