var express = require('express');
var router = express.Router();
var lib = require('../classes/libCalls.js');
/* GET home page. */
router.get('/', function(req, res, next) {

    res.render('result');

});

module.exports = router;
