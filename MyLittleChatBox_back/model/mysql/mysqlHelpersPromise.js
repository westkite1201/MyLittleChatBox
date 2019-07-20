/**
 * MySQL helper functions
 */
const config = require('../../config/dbconfig');
const mysql = require('mysql2/promise');
/* Step 1, create DB Pool */
const pool = mysql.createPool({
	host: config.mysql.host,
	user: config.mysql.user,
	password: config.mysql.password,
	database: config.mysql.database
});


module.exports = {
  // properties
  mysql : mysql,
  pool  : pool,
  // methods
  // doConnect: doConnect,
  // doRelease: doRelease,
  // doCommit: doCommit,
}
