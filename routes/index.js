var express = require('express');
var router = express.Router();
var lib = require('../classes/libCalls.js');
/* GET home page. */
exports.index = function(req, res) {

    var module = req.params.module;
    var tabletop = req.params.tabletop != undefined ? true : false;
    var moduleString = "";
    var page = "visualisation";

    switch(module)
    {
        case "countries":
            moduleString = "__countryHandler";

            break;
        case "timeline":
            moduleString = "__timelineHandler";
            break;
        case "results":
            moduleString = "__resultsHandler";
            break;
        case "newspapers":
            moduleString = "__newspaperHandler";
            break;
        case "user":
            page = "user"
            moduleString = "";
            break;
        case "result":
            page = "result"
            moduleString = "";
            break;
        case "history":
            page = "history"
            moduleString = "";
            break;
        default:
            moduleString = "__resultsHandler";

    }
    res.render(page, {modules:moduleString, tabletop:tabletop});

}


