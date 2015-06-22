var express = require('express');
var router = express.Router();
var lib = require('../classes/libCalls.js');
/* GET home page. */
router.get('/', function(req, res, next) {

    res.render('timeline');

});

module.exports = router;
