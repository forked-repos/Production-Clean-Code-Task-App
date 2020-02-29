import Knex from 'knex';

/**
 * Provides a database instance and connection pool.
 */
export default (): Knex => {
    return Knex({
        client: 'pg',
        version: '12',
        connection: {
            host: '127.0.0.1',
            port: 5432,
            user: 'postgres',
            password: 'root', 
            database: 'task_management'
        }
    });
}

// TODO: Move to environment variables later!