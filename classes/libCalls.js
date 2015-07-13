/**
 * Created by svenc on 16/04/15.
 */
/**
 * Created by svenc on 16/04/15.
 */
var async = require("async");
var rest = require('../classes/RESTful.js');
var db = require('../classes/db.js')

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
    var param = "/opensearch/newspapers?format=json&q=" + encodeURI(query) + "&key="+ apiKey + "&c="+ by + "&s=" + at +  "&ff=(country)"
    //console.log(param);
    rest.doGET("data.theeuropeanlibrary.org", param, null,
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


exports.filteredQuery = function(call, filterId, cb)
{
    var param;
    var queries = call.queries();
    var facets = call.facets();
    console.log(JSON.stringify(facets))
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
                    facetString += "(" + f.toLowerCase() + "," + encodeURIComponent(k) + ")";
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
            console.log("calls done")
            if(err != undefined) console.log("error:" + err);
            cb(results,filterId);
        }
    );







}



function convertQueryAndFacets(call) {
    var queries = call.queries();
    var facets = call.facets();

    var facetLists = [];
    var facetNames = Object.keys(facets);
    facetNames.forEach(function (toExclude) {
        var facet = {};
        Object.keys(facets).forEach(function (f) {

            if (f != toExclude) {
                if(facet[f.toUpperCase()] == undefined)
                    facet[f.toUpperCase()] = [];
                facets[f].forEach(function (k) {
                    facet[f.toUpperCase()].push(k);
                })
            }
        })
        facetLists.push({exclude: toExclude, facets: facet});
    });
    //add one general one for the one widget that started, so that needs all the data
    var facet = {};
    Object.keys(facets).forEach(function (f) {
        if(facet[f.toUpperCase()] == undefined)
            facet[f.toUpperCase()] = [];
        facets[f].forEach(function (k) {
            facet[f.toUpperCase()].push(k);
        })
    });
    ;
    facetLists.push({exclude: "", facets: facet});



    console.log("facets " + JSON.stringify(facetLists));
    return {queries: queries, facetLists: facetLists};
}
exports.filteredQueryLOCAL = function(call, filterId, cb) {
    var __ret = convertQueryAndFacets(call);
    var queries = __ret.queries;
    var facetLists = __ret.facetLists;
    var results = [];
    async.eachSeries(facetLists,
        function (f, callback) {
            console.log("LOCAL: " + JSON.stringify(f.exclude) + " " + JSON.stringify(f.facets))
            db.countText(queries, f.facets,
                function (e, d) {

                    results.push({exclude: f.exclude, result: d});
                    callback();
                });
        },
        function (err) {
            console.log("calls done")
            if (err != undefined) console.log("error:" + err);
            //console.log(JSON.stringify(results));
            cb(results, filterId);
        }
    );
}

exports.getResultsLOCAL = function(filter, cb)
{
    var queries = filter.queries();
    var facets = filter.facets();
    var facet = {};
    Object.keys(facets).forEach(function (f) {
        facets[f].forEach(function (k) {
            facet[f.toUpperCase()] = k;
        })
    });

    //facet = ({exclude: "", facets: facet});


    db.getResults(queries, facet,
        function (e, d) {
            cb(d);
    });

}
