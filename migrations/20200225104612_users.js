exports.up = async function(knex) {
    if (!await knex.schema.hasTable('users'))
        return knex.schema.createTable('users', table => {
            // This is a UUID at the moment. 
            // Will move to Hi/Lo Algorithm later.
            // Of course, don't use a string for a UUID in PG.
            table.uuid('user_id').primary().notNullable(); 
            table.string('first_name', 25).notNullable();
            table.string('last_name', 35).notNullable();
            table.string('username', 20).notNullable();
            table.string('biography', 300).nullable();
            table.string('email', 100).notNullable();
            table.specificType('password', 'CHAR(60)').notNullable();
        });
};

exports.down = function(knex) {
    knex.schema.dropTableIfExists('users');
};
