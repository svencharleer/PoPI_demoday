/**
 * Created by svenc on 16/04/15.
 */
/**
 * Created by svenc on 16/04/15.
 */
var async = require("async");
var rest = require('../classes/RESTful.js');

var apiKey = "apuj4p2ogv9uq8phpo9mqqad3m";


exports.countPapers = function(query,  callback)
{
    var param = "/opensearch/newspapers?format=json&q=" + query + "&key="+ apiKey + "&c=0&ff=(provider:6),(language:10)"

    rest.doGET("data.theeuropeanlibrary.org", param,
        function(data, err){
            callback(data[0].NoOfResults, err)
        });
}

exports.byYearAndLanguage = function(query, facetType, facetValue,  callback)
{
    var param;
    if(facetType == "" || facetValue == "")
        param = "/opensearch/newspapers?format=json&q=" + query + "&key="+ apiKey + "&c=0&ff=(year:1000),(language:1000),(country:1000)"
    else
        param = "/opensearch/newspapers?format=json&q=" + query + "&fq=(" + facetType + ","+ facetValue + ")&key="+ apiKey + "&c=50&ff=(year:1000),(language:1000),(country:1000)"
    console.log(param);
    rest.doGET("data.theeuropeanlibrary.org", param,
        function(data, err){
            console.log("data: " +data);
            console.log("error: " + err);
            callback(data[0], err)
        });
}



//get by "by" papers at offset "at"
exports.getPapersByAt = function(query, by, at,  callback)
{
    var param = "/opensearch/newspapers?format=json&q=" + encodeURI(query) + "&key="+ apiKey + "&c="+ by + "&s" + at +  "&ff=(country)"

    rest.doGET("data.theeuropeanlibrary.org", param,
        function(data, err){

            //console.log(data);
            callback(data, err)
        });
}

//get by "by" papers at offset "at"
exports.getPapersForCountry = function(query, country, userid, originalData, callback)
{


    var param = "/opensearch/newspapers?format=json&q=" + encodeURI(query) + "&key="+ apiKey + "&qf=(country,"+ country +")";
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


exports.filteredQuery = function(call,  cb)
{
    var param;
    var queries = call.queries();
    var facets = call.facets();
    var queryString = "";
    queries.forEach(function(q){
        queryString+= '"' + encodeURIComponent(q) + '"';
    });

    var facetStrings = []; //one for each facet exclude as each widget cannot filter itself
    console.log(JSON.stringify(facets));
    var facetNames = Object.keys(facets);
    facetNames.forEach(function(toExclude){
        var facetString = ""
        Object.keys(facets).forEach(function(f){
            if(f != toExclude) {
                facets[f].forEach(function (k) {
                    facetString += "(" + f.toLowerCase() + "," + k + ")";
                    facetString += "AND";
                });
            }

        })
        facetStrings.push({exclude:toExclude, fstring:facetString});
    });
    //add one general one for the one widget that started, so that needs all the data


    var facetString = ""
    Object.keys(facets).forEach(function(f) {
        facets[f].forEach(function (k) {
            facetString += "(" + f.toLowerCase() + "," + encodeURIComponent(k) + ")";
            facetString += "AND";

        })});
        ;
    facetStrings.push({exclude: "", fstring: facetString});
    //console.log(JSON.stringify(facetStrings));

    var results = [];
    async.eachSeries(facetStrings,
        function (facetString, callback) {


            param = "/opensearch/newspapers?format=json&q=" + queryString + "&fq=" + facetString.fstring + "&key=" + apiKey + "&c=0&ff=(year:1000),(language:1000),(country:1000),(title:1000)"
            console.log(param);

            rest.doGET("data.theeuropeanlibrary.org", param, facetString.exclude,
                function (data, exclude, err) {
                    results.push({exclude: exclude, result: data[0]});
                    callback();
                });
        },
        function (err) {
            cb(results);
        }
    );







}