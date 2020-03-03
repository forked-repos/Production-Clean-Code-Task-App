
exports.up = async function(knex) {
    if (!await knex.schema.hasTable('tasks'))
        return knex.schema.createTable('tasks', table => {
            table.uuid('task_id').primary().notNullable();
            table.string('name', 100).notNullable();
            table.string('description', 300);
            table.uuid('owner').references('user_id').inTable('users').notNullable().onDelete('cascade');
            table.datetime('due_date');
            table.integer('priority').notNullable();
            // This would be better as a boolean "completed"
            table.string('completion_status').notNullable();
        });
};

exports.down = function(knex) {
    knex.schema.dropTableIfExists('tasks');
};
