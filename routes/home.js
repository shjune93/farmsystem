var express = require('express');
var router = express.Router();

// var PORT = 8080;
// var HOST = '127.0.0.1';

// var dgram = require('dgram');
// var message = new Buffer.from('1');

// var s = dgram.createSocket('udp4');


// //const $1_tem=document.getElementById('1-tem');

// //서버에 일정시간마다 요청보내기
// playAlert = setInterval(function() {
// 	s.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
// 		if (err) {
// 			console.log(err);
// 			throw err;
// 		}
// 		console.log('서버로 데이터 요청 ' + HOST + ':' + PORT);
		
// 	});
//  }, 3000);

// //요청한 데이터 받아서 데이터 취합후 html에 주기
// s.on('message', function(msg, rinfo) {
// 	console.log("서버로 부터 받은 메세지 : "+msg);
// 	jsonmsg=JSON.parse(msg);
// 	console.log(typeof(jsonmsg));
// 	document.getElementById('1-tem').innerText=jsonmsg.tem;
	
// 	}
// );
// s.bind(3000); 	

//Home
router.get('/', function(res,res){
	res.render('home/home');
});


module.exports = router;