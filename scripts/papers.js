/**
 * Created by svenc on 16/06/15.
 */
var rest = require('../classes/libCalls.js');
var NoOfResults = 0;
var results = [];

var recursive = function(data){
    NoOfResults += data[0].Results.length;
    //results = results.concat(data[0].Results);
    //console.log(NoOfResults);
    //console.log(results.length);
    //console.log(data[0].NoOfResults);
    data[0].Results.some(function(r,i){
        console.log(JSON.stringify(r));
        console.log(",")
    });

    if(data[0].NoOfResults > NoOfResults)
    {

        rest.getPapersByAt("einstein", 100, NoOfResults,  recursive);
    }
    else
    {
        console.log("]");

    }
}
console.log("[");
rest.getPapersByAt("einstein", 100, 0,recursive);