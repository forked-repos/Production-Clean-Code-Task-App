export type OperationalDomainType = {
    [key: string]: string,

    USERS: 'users',
    TASKS: 'tasks',
}

/**
 * Represents the domains within which the application operates.
 */
export enum OperationalDomain {
    USERS = 'users',
    TASKS = 'tasks',
};