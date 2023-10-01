module.exports = function(passport){
	var express = require('express');
	var router = express.Router();
	var bkfd2Password = require('pbkdf2-password');
	var hasher = bkfd2Password();
	var conn = require('../config/mysql/db')();
	var passport = require('passport');

	//카카오 로그인
	router.get('/kakao', passport.authenticate('kakao-login'));
	router.get('/kakao/callback', passport.authenticate('kakao-login',{
		successRedirect:'/',
		failureRedirect:'/'
	}))


	//로그인 post
	router.post('/login', passport.authenticate('local',{
		successRedirect:'/',
		failureRedirect:'/auth/join',
		failureFlash:false
	}));

	//회원가입 get
	router.get('/join', function(req,res){
		console.log('join');
		var sql = 'select id, title from board';
		conn.query(sql, function(err, boards, fields){
			//res.send(boards);
			res.render('auth/join', {boards:boards});
		});
	});

	//회원가입 post
	router.post('/join', function(req,res){
		hasher({password:req.body.password}, function(err, pass, salt, hash){
			var user = {
				authId:req.body.username,
				username:req.body.username,
				password:hash,
				salt:salt,
				displayName:req.body.displayName
			};
			var sql = 'insert into users set ?';
			conn.query(sql, user, function(err, results){
				if(err){
					console.log(err);
					res.status(500);
				} else {
					console.log('join성공,req.login호출');
					req.login(user, function(err){ //바로 로그인된 화면으로 바꾸기
						req.session.save(function(){
							res.redirect('/');
						});
					});
				}
			});
		});
	})

	//로그인 get
	router.get('/login', function(req,res){
		console.log('login');
		var sql = 'select id, title from board';
		conn.query(sql, function(err, boards, fields){
			res.render('auth/login', {boards:boards});
		});
	});

	//로그아웃
	router.get('/logout', function(req,res){
		req.logout();
		req.session.destroy();
		res.clearCookie('sid');
		console.log('로그아웃됨');

		res.redirect('/');
	});

	return router;
}




