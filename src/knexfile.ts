module.exports = {
  	development: {
    	client: "postgresql",
    	connection: {
      		filename: "./dev.sqlite3"
    	}
  	},

  	staging: {
		client: "postgresql",
		connection: {
			database: "my_db",
			user: "username",
			password: "password"
		},
		pool: {
			min: 2,
			max: 10
		},
		migrations: {
			tableName: "db/staging/knex_migrations"
		}
  	},

  	production: {
    	client: "postgresql",
    	connection: {
			database: "my_db",
			user: "username",
			password: "password"
    	},
    	pool: {
			min: 2,
			max: 10
    	},
    	migrations: {
      		tableName: "db/prod/knex_migrations"
    	}
  	}
};
