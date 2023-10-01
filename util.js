// util.js
var util = {};

util.isLoggedin = function(req,res,next){
	if(req.isAuthenticated()){
		next();
	} else {
		console.log('util',util);
		res.send('<script type="text/javascript">alert("로그인을 해주세요.");location.href="/auth/login";</script>');
	}
}

//util.noPermission = function(req,res){
	//req.logout();
	//res.sendRedirect('/');
//}

util.noPermission = function(req,res){
	res.send('<script type="text/javascript">alert("권한이 없습니다.");location.href="/posts";</script>');
}


module.exports = util;
