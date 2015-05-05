/**
 * Created by svenc on 16/04/15.
 */
/**
 * Created by svenc on 16/04/15.
 */

var rest = require('../classes/RESTful.js');

var apiKey = "apuj4p2ogv9uq8phpo9mqqad3m";


exports.countPapers = function(query,  callback)
{
    var param = "/opensearch/catalogue?format=json&q=" + query + "&key="+ apiKey + "&c=0&ff=(provider:6),(language:10)"

    rest.doGET("data.theeuropeanlibrary.org", param,
        function(data, err){
            callback(data[0].NoOfResults, err)
        });
}

//get by "by" papers at offset "at"
exports.getPapersByAt = function(query, by, at,  callback)
{
    var param = "/opensearch/catalogue?format=json&q=" + encodeURI(query) + "&key="+ apiKey + "&c="+ by + "&s" + at +  "&ff=(country)"

    rest.doGET("data.theeuropeanlibrary.org", param,
        function(data, err){

            console.log(data);
            callback(data, err)
        });
}

//get by "by" papers at offset "at"
exports.getPapersForCountry = function(query, country, userid, originalData, callback)
{


    var param = "/opensearch/catalogue?format=json&q=" + encodeURI(query) + "&key="+ apiKey + "&qf=(country,"+ country +")";
    console.log(param);
    rest.doGET2("data.theeuropeanlibrary.org", param, originalData,
        function(data, originalData){

            console.log("data:" + data);
            console.log("original" + originalData);
            console.log("id" + userid);
            originalData[userid] = data != undefined ? data[0].Results : [];
            callback(originalData);
        });
}

