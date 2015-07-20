var http = require('http');
var curl = require("curlrequest");
var cheerio = require("cheerio");
var URL = require("url");


exports.doGET2 = function(host, path, originalData, callback, auth ) {

    var options = {
        host: host,
        port: 80,
        path: path,
        method: 'GET'
    };
    if(auth != undefined)
    {
        options.headers = {"Authorization": auth};
    }
    //console.log(host);
    //console.log(path);
    var lastChunk = "";
    var totalData = [];
    var dataPerPage = "";


    var fetchRequest = function (result) {

        result.setEncoding('utf8');
        result.on('data', function (chunk) {
            dataPerPage += chunk;
            lastChunk = chunk;

        });
        result.on('end', function () {
            ////console.log(dataPerPage);
            totalData = totalData.concat(JSON.parse(dataPerPage));

            callback(totalData, originalData);



        });
    }

    var req = http.request(options, fetchRequest);


    req.end();
    return;
}

exports.doGET = function(host, path, extra,callback, auth) {

    var options = {
        host: host,
        port: 80,
        path: path,
        method: 'GET'
    };
    if(auth != undefined)
    {
        options.headers = {"Authorization": auth};
    }
    //console.log(host);
    //console.log(path);
    var lastChunk = "";
    var totalData = [];
    var dataPerPage = "";


    var fetchRequest = function (result) {

        result.setEncoding('utf8');
        result.on('data', function (chunk) {
            dataPerPage += chunk;
            lastChunk = chunk;

        });
        result.on('end', function () {
            ////console.log(dataPerPage);
            try {
                totalData = totalData.concat(JSON.parse(dataPerPage));
            }
            catch(exc)
            {
                console.log(dataPerPage);
                totalData = [];
            }
            callback(totalData, extra);



        });
    }

    var req = http.request(options, fetchRequest);


    req.end();
    return;
}

exports.doGET_many = function(host, path, callback) {

    var options = {
        host: host,
        port: 80,
        path: path + "&offset=0",
        method: 'GET'
    };
    //console.log(host);
    //console.log(path);
    var lastChunk = "";
    var totalData = [];
    var dataPerPage = "";
    var page = 0;

    var fetchRequest = function (result) {

        result.setEncoding('utf8');
        result.on('data', function (chunk) {
            dataPerPage += chunk;
            lastChunk = chunk;

        });
        result.on('end', function () {
            ////console.log(dataPerPage);
            totalData = totalData.concat(JSON.parse(dataPerPage).result);
            if(JSON.parse(dataPerPage).result.length ==0)
            {

                callback(totalData);
                return;
            }
            dataPerPage = "";
            page+=100;
            options.path = path + "&offset=" + page;
            var req = http.request(options, fetchRequest);
            req.end();



        });
    }

    var req = http.request(options, fetchRequest);


    req.end();
    return;
}

exports.scrapeURLFromEuropeana = function(id, callback)
{
    var url = "http://www.theeuropeanlibrary.org//tel4/record/" + id;//"3000118643765";
    console.log(url);

    var options = { url: url, include: true };

    curl.request(options, function (err, parts) {
        parts = parts.split('\r\n');
        var data = parts.pop()
            , head = parts.pop();
        //console.log(data);
        var $ = cheerio.load(data);
        //console.log(body);
        //console.log($("#result-item ul.list a"));
        $("#result-item ul.list a").each(function() {

            var link = $(this);
            var text = link.text();
            var href = link.attr("href");
            if(text == "Access Online") {
                callback(href);
                return true;
            }
        });
        //callback("http://google.com");

    });
}


