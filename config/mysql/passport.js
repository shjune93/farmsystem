module.exports = function(app){
	var conn = require('./db')();
	var bkfd2Password = require('pbkdf2-password');
	var passport = require('passport');
	var LocalStrategy = require('passport-local').Strategy;
	var KakaoStrategy = require('passport-kakao').Strategy;
	var hasher = bkfd2Password();
	app.use(passport.initialize());
	app.use(passport.session());

	passport.serializeUser(function(user, done){
		console.log('serializeUser호출, user:',user);
		done(null, user.authId);
	});
	passport.deserializeUser(function(id, done){
		console.log('deserializeUser호출, id:', id);
		var sql = 'select * from users where authId=?';
		conn.query(sql, [id], function(err, results){
			if(err){
				console.log(err);
				done('There is no user');
			} else {
				done(null, results[0]);
			}
		});
	});

//기본 로그인
	passport.use(new LocalStrategy(function(username, password, done){
		var uname = username;
		var pwd = password;
		var sql = 'select * from users where authId=?';
		conn.query(sql, ['local:'+uname], function(err, results){
			if(err){
				return done(err);
			}
			if(results[0] === undefined){
				return done(null, false);
			} else {
			var user = results[0];
			console.log('results[0]',results[0]);
			return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
				if(hash === user.password){
				//	console.log('LocalStrategy, user : ', user);
					done(null, user);
				} else {
					done(null, false);
					}
				});
			}
		});
	}));

//카카오 로그인
	passport.use('kakao-login', new KakaoStrategy({
		clientID:'59788f0c5052a377b237d4c651221b1c',
		clientSecret:'VNHrT7kRkZZf0mOGcRe0H2RR1nPhpLHD',
		callbackURL:'http://localhost:7777/auth/kakao/callback'
	},
	function(accessToken, refreshToken, profile, done){
		console.log('profile:'+profile);
		console.log('profile.id:'+profile.id);
		console.log('profile.nickname:'+profile.nickname);
			//return done(null, profile);
		var authId = 'kakao:'+profile.id;
		var displayName = profile.nickname;
		var sql = 'select * from users where authId=?';
		conn.query(sql,[authId], function(err, results){
			if(err){
				return done(err);
			}
			if(results.length === 0){
				//신규유저는 회원가입 이후 로그인 처리
				var signup = 'insert into users set authId=?, displayName=?';
				conn.query(signup, [authId, displayName],function(err, result){
					if(err){
						return done(err);
					} else {
						done(null, {
							'authId':authId,
							'displayName':displayName
						});
					}
				});
			} else {
				//기존 유저 로그인 처리
				console.log('기존 유저');
				done(null,{
					'authId':results[0].authId,
					'displayName':results[0].displayName
				});
			}
		});

			
	}));


	return passport;
}