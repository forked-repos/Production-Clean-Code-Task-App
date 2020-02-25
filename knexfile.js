module.exports = {
  	development: {
    	client: "postgresql",
  		connection: {
    		host: '127.0.0.1',
          	port: 5433,
    		database: "task_management",
    		user: "postgres",
    		password: "root"
  		},
  		migrations: {
    		directory: './migrations',
  		}
  	},

  	staging: {
  		client: "postgresql",
  		connection: {
			database: "task_management",
			user: "postgres",
			password: "root"
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
