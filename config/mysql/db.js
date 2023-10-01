module.exports = function(){
	var mysql = require("mysql");
	var conn = mysql.createConnection({
		host : '127.0.0.1',
		user : 'root',
		password : 'skygogo#1212',
		database : 'project'
	});
	return conn;
}