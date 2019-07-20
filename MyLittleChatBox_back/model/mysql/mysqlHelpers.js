/**
 * MySQL helper functions
 */

const config = require('../../config/dbconfig');
const mysql = require('mysql');

const poolConnection = mysql.createPool({
  connectionLimit   : 100,
  user              : config.mysql.user,
  password          : config.mysql.password,
  host              : config.mysql.host,
  database          : config.mysql.database,
  waitForConnections: false,
  multipleStatements: true,
})

console.log(config.mysql);

const doConnect = (cb) => {
  const connection = mysql.createConnection(
  {
    user              : config.mysql.user,
    password          : config.mysql.password,
    host              : config.mysql.host,
    database          : config.mysql.database,
    multipleStatements: true,
  });

  connection.connect();
  cb(null, connection);
}

const doRelease = (conn) => {
  conn.end((err) => {
    if (err)
      console.error(err.message);
  });
}

const doCommit = (conn) => {
  conn.commit((error) => {
    if( error ){
      return conn.rollback(() => {
        throw error;
      })
    }
  });
}

module.exports = {
  // properties
  mysql : mysql,
  pool  : poolConnection,
  // methods
  doConnect: doConnect,
  doRelease: doRelease,
  doCommit: doCommit,
}
