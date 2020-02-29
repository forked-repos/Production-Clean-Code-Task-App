
exports.up = async function(knex) {
    if (!await knex.schema.hasTable('outbox'))
        return knex.schema.createTable('outbox', table => {
            table.uuid('outbox_id').primary().notNullable();
            table.string('operational_domain', 50).notNullable();
            table.string('operational_channel', 50).notNullable();
            table.date('processed_date').defaultTo(null);
            table.string('payload', 1000);
        });
};

exports.down = function(knex) {
    knex.schema.dropTableIfExists('outbox');
};
