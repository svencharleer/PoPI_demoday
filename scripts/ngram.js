/**
 * Created by svenc on 16/06/15.
 */
var rest = require('../classes/libCalls.js');
var NoOfResults = 0;
var results = [];



rest.byYearAndLanguage("",function(data){
    console.log(JSON.stringify(data));
});