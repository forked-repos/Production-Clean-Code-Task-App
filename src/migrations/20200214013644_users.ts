import * as Knex from "knex";


export const up = async (knex: Knex): Promise<any> => {
    // TODO: Add array for S3 URLs here.
    knex.schema.createTable('users', table => {
        table.increments('user_id');
        table.string('first_name', 25).notNullable();
        table.string('last_name', 35).notNullable();
        table.string('username', 20).notNullable();
        table.string('biography', 300).nullable();
        table.string('email', 100).notNullable();
        table.specificType('password', 'CHAR(60)').notNullable();
    });
}


export const down = async (knex: Knex): Promise<any> => {
    knex.schema.dropTableIfExists('users');
}

