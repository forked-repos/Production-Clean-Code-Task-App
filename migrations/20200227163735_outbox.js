
exports.up = async function(knex) {
    if (!await knex.schema.hasTable('outbox'))
        return knex.schema.createTable('outbox', table => {
            table.uuid('outbox_id').primary().notNullable();
            table.string('domain', 15).notNullable();
            table.string('payload', 1000);
        });
};

exports.down = function(knex) {
    knex.schema.dropTableIfExists('outbox');
};
