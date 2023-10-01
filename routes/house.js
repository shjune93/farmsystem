// routes/home.js
var express = require('express');
var router = express.Router();
var conn = require('../config/mysql/db')();

router.get('/A', function(req,res){
    //console.log('Accessing the secret section ...');
	res.render('house/AHouse')
});
router.get('/B', function(req,res){
	res.render('house/BHouse');
})
router.get('/C', function(res,res){
	res.render('house/CHouse');
});

module.exports = router;