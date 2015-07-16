/**
 * Created by svenc on 03/07/15.
 */

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/ecloud');
//mongoose.connect('mongodb://davinci.cs.kuleuven.be:27017/ecloud');
//var server = new Server('ensor.cs.kuleuven.be', 27017, {auto_reconnect: true});

var db_connection = mongoose.connection;
db_connection.on('error', console.error.bind(console, 'connection error:'));
db_connection.once('open', function callback () {

    console.log("Connected to the database");




});


var Schema = mongoose.Schema;

var paperSchema = new Schema({
    //_id: String,
    PROVIDER_ID: String,
    LANGUAGE: String,
    COLLECTION_ID: Number,
    COUNTRY: String,
    FULL_TEXT: String,
    DATE: Date,
    ID: String,
    CREATED: String,
    TITLE: String,
    URI: String
},{collection:"papers"});


var Paper = mongoose.model('Paper',paperSchema);

exports.Paper = Paper;


/***************** QUERY METHODS *********************/

exports.queryAll = function() {

    var query = Paper.find({});
    return query;
};

exports.countText = function(queries, facets, callback) {


    var match = {};
    var queryString = "";
    queries.some(function(q){
        queryString += '\"' +q + '\" ';
    })
    if(queries.length > 0)
        match["$text"] = {$search: queryString};
    if(facets["COUNTRY"]!= undefined)
        match["COUNTRY"] = {$in: facets["COUNTRY"]};
    if(facets["LANGUAGE"]!= undefined)
        match["LANGUAGE"] = {$in: facets["LANGUAGE"]};
    if(facets["TITLE"]!= undefined)
        match["TITLE"] = {$in: facets["TITLE"]};

    //year is a special case. it's a range.
    if(facets["YEAR"]!= undefined)
    {
        console.log("is this even called" + facets["YEAR"])
        var min = new Date();
        min.setFullYear(facets["YEAR"][0][0],0,1);
        var max = new Date();
        max.setFullYear(facets["YEAR"][0][1],0,1);
        match["DATE"] = {$gte: min, $lte: max }
    }

    match = {$match:match};
    console.log(JSON.stringify(match));
    //console.log(match);
    Paper.aggregate([match,
        {"$group":{_id:
                {LANGUAGE:"$LANGUAGE",COUNTRY:"$COUNTRY",TITLE:"$TITLE", YEAR:{$year:"$DATE"}},
                    count: { $sum : 1 }}}],
        function(err,data){
            //aggregate it like the API does (although seperately might be interesting for cooler vis
            var facets = {LANGUAGE:{}, TITLE:{}, COUNTRY:{}, YEAR:{}};
            data.some(function(d) {
                //console.log(d);
                Object.keys(facets).some(function (f) {

                    if (facets[f][d._id[f]] == undefined)
                        facets[f][d._id[f]] = 0;
                    facets[f][d._id[f]] += d.count;
                })
            });


            callback(err,facets);
        });


};

exports.getResults = function(queries, facets, callback)

{

    console.log(facets);
    var match = {};
    var queryString = "";
    queries.some(function(q){
        queryString += '\"' +q + '\" ';
    })
    if(queries.length > 0)
        match["$text"] = {$search: queryString};
    if(facets["COUNTRY"]!= undefined)
        match["COUNTRY"] = {$in: facets["COUNTRY"]};
    if(facets["LANGUAGE"]!= undefined)
        match["LANGUAGE"] = {$in: facets["LANGUAGE"]};
    if(facets["TITLE"]!= undefined)
        match["TITLE"] = {$in: facets["TITLE"]};
    if(facets["YEAR"]!= undefined)
    {
        console.log("is this even called" + facets["YEAR"])
        var min = new Date();
        min.setFullYear(facets["YEAR"][0][0],0,1);
        var max = new Date();
        max.setFullYear(facets["YEAR"][0][1],0,1);
        match["DATE"] = {$gte: min, $lte: max }
    }
    console.log("match for results: " + JSON.stringify(match))
    Paper.find(match, callback);
}

exports.countText_byCountry = function(text, callback) {
    Paper.aggregate([{$match:{$text:{$search: text}}},
        {"$group":{_id:
        {COUNTRY:"$COUNTRY"},
            count: { $sum : 1 }}}], callback)
};

exports.countText_byLanguage = function(text, callback) {
    Paper.aggregate([{$match:{$text:{$search: text}}},
        {"$group":{_id:
        {LANGUAGE:"$LANGUAGE"},
            count: { $sum : 1 }}}], callback)
};

exports.countText_byTitle = function(text, callback) {
    Paper.aggregate([{$match:{$text:{$search: text}}},
        {"$group":{_id:
        {TITLE:"$TITLE"},
            count: { $sum : 1 }}}], callback)
};

exports.countText_Total = function(text, callback) {
    Paper.count({$text:{$search: text}}
        , callback)
};




