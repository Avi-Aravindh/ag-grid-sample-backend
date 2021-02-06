require('dotenv').config();
console.log(process.env);
const knex = require('knex')({
  client: 'pg',
  connection: {
    host: process.env.HOST,
    user: process.env.DBUSER,
    password: process.env.PASSWORD,
    database: process.env.DB,
  },
  pool: {
    min: 0,
    max: 7,
    afterCreate: (conn, done) => {
      conn.query('SET timezone="UTC";', (err) => {
        if (err) {
          console.log(err);
        }
        done(err, conn);
      });
    },
  },
});

module.exports = knex;
