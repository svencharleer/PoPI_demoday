var http = require('http');

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