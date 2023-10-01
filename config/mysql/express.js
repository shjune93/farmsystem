module.exports = function(){
	var express = require('express');
	var session = require('express-session');
	var MySQLStore = require('express-mysql-session')(session);
	var bodyParser = require('body-parser');

	var app = express();
	app.set('view engine', 'ejs');
	app.use(bodyParser.json());

	app.use(bodyParser.urlencoded({extended:false}));
	app.use(session({
		key:'sid',
		secret:'1234dfga@as1234!!@#$$',
		resave:false,
		saveUninitialized:true,
		store:new MySQLStore({
			host:'localhost',
			port:3306,
			user:'root',
			password:'skygogo#1212',
			database:'project'
			})
		}));
		return app;
}