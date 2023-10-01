var express = require('express');
var router = express.Router();
var conn = require('../config/mysql/db')();
var util = require('../util');
var datetime = require('node-datetime');

// Index (글 목록)
router.get('/', function(req,res){
	var pageSize = 10; // 페이지당 게시물 수 ( 한 페이지 당 10개 게시물)
	var pageListSize=10; // 페이지의 갯수 1 ~ 10개 페이지
	var no = ""; // limit 변수
	var totalPageCount = 0; // 전체 게시물의 숫자
	var sql = 'select count(*) as cnt from board';
	conn.query(sql, function(err, boards){
		if (err){ 
			console.log(err + "조회실패");
			return
		}
		totalPageCount = boards[0].cnt // 전체 게시물의 숫자
		var curPage = Number(req.query.page); //현재 페이징 번호 쿼리스트링으로 받음
		//만약 페이징 번호가 없을 시에는 1로 설정
		if(!curPage){
			curPage = 1;
		}
		console.log('현재 페이지 : '+curPage,"전체 페이지:"+totalPageCount);

		// 전체 페이지 갯수
		if( totalPageCount < 0 ){
			totalPageCount = 0 ;
		}

		var totalPage = Math.ceil(totalPageCount / pageSize); //전체 페이지 수 
		var totalSet = Math.ceil(totalPage / pageListSize); //전체 세트 수
		var curSet = Math.ceil(curPage / pageListSize)//현재 세트 번호
		var startPage = ((curSet-1) * 10) + 1 //현재 세트내 출력될 시작 페이지
		var endPage = (startPage + pageListSize) - 1;//현재 세트내 출력될 마지막 페이지

		//현재 페이지가 0보다 작으면
		if(curPage<0){
			no = 0
		} else{
			//0보다 크면 limit함수에 들어갈 첫번째 인자 값 구하기
			no = (curPage - 1) * 10
		}

		var result2 = {
			"curPage":curPage,
			"pageListSize":pageListSize,
			"pageSize":pageSize,
			"totalPage":totalPage,
			"totalSet":totalSet,
			"curSet":curSet,
			"startPage":startPage,
			"endPage":endPage
		};

		var sql = 'select id,title,author,date_format(reg_date, "%Y.%m.%d") reg_date from board order by id desc limit ?,?';
		conn.query(sql,[no,pageSize], function(err2,boards){
			if(err2){
				console.log("페이징 에러" + err2);
				return
			}
			res.render('posts/index',{boards:boards, pasing:result2})
			console.log('no, pageSize'+no+pageSize)

		})


	})
	
});

// Show (글 상세보기)
router.get('/:id', function(req,res){
	console.log("req.params.id -> id : " + req.params.id);
	var id = req.params.id;
	var sql = 'select * from board where id = ?';
	conn.query(sql, [id], function(err, boards, fields){
		if(err){
			console.log(err);
		} else {
			//res.send(boards);
			//console.log('req.user.authId',req.user.authId);
			res.render('posts/show',{boards:boards, boards:boards[0]});
		}
	})
})

// New ( get/view페이지  )
router.get('/new', util.isLoggedin, function(req,res){
	//console.log("new");
	//console.log('req.user:',req.user)
	res.render('posts/new');
});

// Create ( post/글 생성 )
router.post('/', util.isLoggedin, function(req,res){
	console.log('create');
	var title = req.body.title;
	var description = req.body.description;
	var author = req.user.username;
	var sql = 'insert into board (title, description, author, reg_date) values(?,?,?,now())';
	conn.query(sql, [title, description, author], function(err, result, fields){
		if(err){
			console.log(err)
		} else { 
			//res.send(result);
			res.redirect('/posts/detail/'+result.insertId)
		}
	});
});

// Edit ( get/view페이지 )
router.get('/:id/edit', util.isLoggedin, checkPermission, function(req,res){
	console.log('edit-get');
	var id = req.params.id;
	var sql = 'select * from board where id=?';
	conn.query(sql, [id], function(err, boards, fields){
		if(err){
			console.log(err);
		} else {
			res.render('posts/edit',{boards:boards, boards:boards[0]});
		}
	})
});

// Update
router.put('/:id', util.isLoggedin, checkPermission, function(req,res){
	var title = req.body.title;
	var description = req.body.description;
	var author = req.user.username;
	var id = req.params.id;
	var sql = 'update board set title=?, description=?, author=?, reg_date=now() where id=?';
	conn.query(sql, [title, description, author, id], function(err, result, fields){
		if(err){
			console.log(err);
		} else {
			res.redirect('/posts');
		}		
	})
})

// Delete (post/편집)
router.delete('/:id', util.isLoggedin, checkPermission, function(req,res){
	var id = req.params.id;
	var sql = 'delete from board where id = ?';
	conn.query(sql, [id], function(err, result){
		if(err) return res.json(err);
		res.redirect('/posts');
	});
});
module.exports = router;

//private functions
function checkPermission(req,res,next){
	console.log("req.params.id:",req.params.id); //6
	var id = req.params.id;
	var sql = 'select * from board where id = ?';
	conn.query(sql, [id], function(err, boards, fields){
		//console.log('boards',boards);
		//console.log("boards[0].id",boards[0].id); //undefined /6
		//console.log("boards[0].author",boards[0].author); //undefined/미소
		//console.log("req.user.id:",req.user.id); //20
		//console.log("req.user",req.user);
		if(err) return res.json(err);
		if(boards[0].author != req.user.username){
			return util.noPermission(req, res);
		}

		next();
	});
}
