import * as Knex from "knex";

export const up = (knex: Knex)  => {
    // TODO: Add array for S3 URLs here.
    //await knex.schema.dropTableIfExists('users'); // Change this before prod!
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


export const down = (knex: Knex) => {
    knex.schema.dropTableIfExists('users');
}

