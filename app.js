var http = require('http');
var express = require('express');
var methodOverride = require('method-override');
var app = require('./config/mysql/express')();
var passport = require('./config/mysql/passport')(app);
var server = http.createServer(app);

//db
var mysql = require("mysql");
var conn = mysql.createConnection({
		host : '127.0.0.1',
		user : 'root',
		password : 'skygogo#1212',
		database : 'project'
	});
conn.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  });

//메세지 받으면 //html 페이지에 따라 메세지 다르게 보내고 받기
//소켓
const {Server}=require('socket.io');
// const io=new Server(server);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
io.on('connection',(socket)=>{
  console.log('a user connected');
  socket.on('disconnect',()=>{
    console.log('user disconnected');
  });
  socket.on('arduino', (msg)=> {
    msgString=msg.toString();
    console.log(msgString);
    console.log("여기까지")
    //json문자열을 javascript객체로 각속성에 접근가능
    var jsonmsg=JSON.parse(msgString);
    console.log(jsonmsg);
    //json형식의 문자열 반환
    var sqlInsert = 'INSERT INTO farmEnvi(ardu_id, tem, humi,date) VALUES ('+jsonmsg.ardu_id+','+jsonmsg.temp+','+ jsonmsg.humidity+', NOW());';
    
    conn.query(sqlInsert, function (err, result) {
    
      if (err) throw err;
  
      console.log("1 record inserted");
    
  });
  });
  
  
});
let playAlert = setInterval(function() {
  conn.query("select ardu_id, tem, humi, date from farmEnvi order by date desc limit 1", function (err, results) {
    if (err) throw err;
    //console.log(results.at(-1).tem); // tag1 using mysql2
    //console.log(results.at(-1).humi); // item1 using mysql2
    //console.log(typeof(results));
    //메시지 생성
    message=JSON.stringify(results);
  //메시지 보내기
  io.emit('show', message);
});
}, 3000);


 var dgram = require('dgram');
 var s = dgram.createSocket('udp4');
//서버열기
 s.on('message', function(msg, rinfo) {
   //html에서 1데이터 보내면
   if (msg == '1'){
     //db조회 마지막데이터만
     //나중에 그룹으로 하면 https://myhappyman.tistory.com/76
     conn.query("select ardu_id, tem, humi, date from farmEnvi order by date desc limit 1", function (err, results) {
       if (err) throw err;
       //console.log(results)
       //console.log(results.at(-1).tem); // tag1 using mysql2
       //console.log(results.at(-1).humi); // item1 using mysql2
       console.log(typeof(results));
       message=JSON.stringify(results);
       //메세지 만들기
     //데이터보내기
       s.send(message, 0, message.length, 3000, rinfo.address, function(err, bytes) {
       if (err) {
         console.log(err);
         throw err;
       }
       console.log('udp 클라이언트한테 전송 ' + rinfo.address + ':' + 3000);
      
     });
     });
    

   }
   else{
     //아두이노에서 데이터 받아서 DB에 저장
     msgString=msg.toString();
     console.log(msgString);
     //json문자열을 javascript객체로 각속성에 접근가능
     var jsonmsg=JSON.parse(msgString);
     console.log(jsonmsg);
     //json형식의 문자열 반환
     var sqlInsert = 'INSERT INTO farmEnvi(ardu_id, tem, humi,date) VALUES ('+jsonmsg.ardu_id+','+jsonmsg.temp+','+ jsonmsg.humidity+', NOW());';
    
     conn.query(sqlInsert, function (err, result) {
    
       if (err) throw err;

       console.log("1 record inserted");

     });
   }
   });

 s.bind(8080); 

app.use(express.static(__dirname + '/public'));
//app.use('/upload', express.static('uploads'));
//가상 경로 설정, 내부적으로 /upload라는 가상경로로 접근

console.log(__dirname);
app.use(methodOverride("_method"));

//custom middlewares
app.use(function(req,res,next){
	res.locals.isAuthenticated = req.isAuthenticated();
	res.locals.currentUser = req.user;
	next();
});

// Routes
app.use('/', require('./routes/home'));
app.use('/posts', require('./routes/posts'));
app.use('/house', require('./routes/house'));
//app.use('/upload', require('./routes/upload'));

var auth = require('./routes/auth')(passport);
app.use('/auth', auth);


server.listen(process.env.PORT || 8080, function(){
	console.log("8080포트에서 웹서버 가동중");
});
