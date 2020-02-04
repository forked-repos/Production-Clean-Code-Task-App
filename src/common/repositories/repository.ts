/**
 * Base methods for all repositories.
 */
export interface IRepository<T> {
    exists(t: T): Promise<boolean>;
    exists(id: number): Promise<boolean>;
}