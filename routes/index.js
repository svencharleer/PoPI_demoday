var express = require('express');
var router = express.Router();
var lib = require('../classes/libCalls.js');
/* GET home page. */
router.get('/', function(req, res, next) {

    res.render('index');

});

module.exports = router;
