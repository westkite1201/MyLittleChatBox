//const User = require('../database/models/user')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const session = require('express-session');

const async = require('async');

const contentDao = require('../../model/mysql/contentDao');

const memberDao = require('../../model/mysql/memberDao');


const auth = require('../auth/auth');

passport.use('local', new LocalStrategy({
		usernameField: 'mem_userid',
		passwordField: 'mem_password',
		session: true,
	},

	async (mem_userid, mem_password, done) => {
		console.log("mem_userid: ",mem_userid);
		console.log("mem_password: ",mem_password);

		const data = {
			mem_userid: mem_userid,
			mem_password: mem_password
		}

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
						console.log(row)
						const user = {
							'id': row.mem_userid,
							'user_gb': row.mem_gb_cd,
							'idx' : row.mem_idx,
							'user_name' : row.mem_username,
							'pwd': row.mem_password,
							'status' : row.mem_status
						}
						console.log(user.pwd , mem_password)
						console.log(user.status)
						if( user.pwd === mem_password  && user.status === 'Y' ){
							const token = await auth.generateToken({
								user: user.id,
								user_gb: user.user_gb
							});
							console.log(user.user_name)
							return done(null, user, {
								message: 'passport: login success',
								token: token,
								gb: user.user_gb,
								idx : user.idx,
								user_name : user.user_name,
								id : user.id,
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

module.exports = passport
