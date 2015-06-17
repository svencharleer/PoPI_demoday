/**
 * Created by svenc on 16/06/15.
 */
var rest = require('../classes/libCalls.js');
var NoOfResults = 0;
var results = [];

var recursive = function(data){
    NoOfResults += data[0].Results.length;
    results = results.concat(data[0].Results);
    //console.log(NoOfResults);
    if(data[0].NoOfResults > NoOfResults)
    {
        rest.getPapersByAt("hitler", 1000, NoOfResults,  recursive);
    }
    else
    {
        console.log(JSON.stringify(results));
    }
}

rest.getPapersByAt("hitler", 1000, 0,recursive);