//const User = require('../database/models/user')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const async = require('async');
const memberDao = require('../../model/mysql/memberDao');
const auth = require('../auth/auth');

passport.use('local', new LocalStrategy({
		usernameField: 'mem_userid',
		passwordField: 'mem_password',
		session: true,
	},
	async (mem_userid, mem_password, done) => {

		const data = {
			mem_userid: mem_userid,
			mem_password: mem_password
		}
		console.log('data , ' , data)
		console.log(mem_userid, mem_password)
		async.waterfall(
			[
				(cb) => {
					memberDao.connect(cb)
				},
				(conn, cb) => {
					memberDao.getLoginData(conn, data, cb)
				}
			],
			async( err, conn, result) => {
				if(conn){
					memberDao.release(conn)
				}
				if(err){
					return done(err, mem_userid, {
						message: 'passport: waterfall error',
						code: 400
					});
				}
				else{
					if(result.length === 1) {
						const row = result[0];
						const user = {
							'id': row.mem_userid,
							'user_gb': row.mem_gb_cd,
							'pwd': row.mem_password,
							'status' : row.mem_status,
							'user_name' : row.mem_username
						}
						if( user.pwd === mem_password  && user.status === 'Y'){

							const token = await auth.generateToken({
								user: user.id,
								user_gb: user.user_gb
                            });
                            //console.log("시발!!!" , user.user_name)
							return done(null, user, {
								message: 'passport: login success',
								token: token,
								gb: user.user_gb,
								user_name : user.user_name,
								code: 100
							})
						}
						else if( user.status === 'N'){
							return done(null, user, {
								message: 'passport: login failure - standbyApporove',
								code: 400
							})
							
						}
						else{
							return done(null, user, {
								message: 'passport: login failure - user id & password mismatched.',
								code: 200
							})
						}
					}
					else{
						return done(null, mem_userid, {
								message: 'passport: user id not exists.',
								code: 300
						})
					}
				}
			}
		)
    }
))
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey   : 'your_jwt_secret'
},
function (jwtPayload, cb) {

    //find the user in db if needed
    return UserModel.findOneById(jwtPayload.id)
        .then(user => {
            return cb(null, user);
        })
        .catch(err => {
            return cb(err);
        });
}
));

module.exports = passport
