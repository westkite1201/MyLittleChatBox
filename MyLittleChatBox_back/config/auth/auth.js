const jwt = require('jsonwebtoken');
const util = require('util');
const config = require('../../src/lib/serverConfig');

const async = require('async');

const generateToken = (data) => {
  try {
    // console.log('---------- auth:generateToken ---------')
    // console.log('req.user => ');
    // console.log(req.user);

    //const expiresIn = 60 * 60 * 24;     // 1 days
    const token = jwt.sign({ id : data.user_id , mem_email : data.mem_email, gb: data.gb_cd }, config.auth.jwt.secret, { expiresIn: '1d' });
    // console.log(token);
    return token;
  }
  catch(error) {
    console.error(error);
  }
};

// Web server & rest api - express-jwt built-in
const verifyToken = async (token) => {
  try {
    // console.log('---------- auth:verifyToken ---------')

    if(!token) {
      // winstonLogger.log('error', 'verifyToken: not logged in.');
      return res.status(401).json({
        code: 401,
        message: 'verifyToken: not logged in.'
      });
    }

    // verify and decode token
    const verify_info = await jwt.verify(token, config.auth.jwt.secret, (err, decoded) => {
      if (err) {
        // winstonLogger.log('error', err);
        return ({
          code: 403,
          message: 'verifyToken: error = ' + err
        });
      }
      else {
        const info = {
          'user_id' : decoded.uid,
          'user_gb' : decoded.gb,
          'code': 100
        };

        // winstonLogger.log('info', 'auth:verifyToken: logged in. decoded = %s', JSON.stringify(decoded));
        return info;
      }
    });
    return verify_info;
  }
  catch(error) {
    // winstonLogger.log('error', error);
  }
};

module.exports = {
  // -------------------------------------------------
  // Web server - Rest api
  // -------------------------------------------------

  generateToken: generateToken,
  verifyToken: verifyToken,
}
