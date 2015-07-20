var express = require('express');
var router = express.Router();
var lib = require('../classes/libCalls.js');
/* GET home page. */
exports.index = function(req, res) {

    var module = req.params.module;
    var tabletop = req.params.tabletop != undefined ? true : false;
    var sessionID = req.params.sessionID;
    var moduleString = "";
    var page = "visualisation";
    var layout = "";
    switch(module)
    {
        case "countries":
            moduleString = "__countryHandler";
            layout = {CountryHandler:{x:0,y:0,w:1,h:1}}
            break;
        case "timeline":
            moduleString = "__timelineHandler";
            layout = {TimelineHandler:{x:0.1,y:0.1,w:.8,h:.8}}
            break;
        case "results":
            moduleString = "__resultsHandler";
            layout = {ResultsHandler:{x:0.1,y:0.1,w:.8,h:.8}}
            break;
        case "newspapers":
            moduleString = "__newspaperHandler";
            layout = {NewspaperHandler:{x:0.1,y:0.1,w:.8,h:.8}}
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
        case "custom":
            moduleString = "__countryHandler,__resultsHandler,__timelineHandler,__newspaperHandler";
            layout = {
                TimelineHandler:{x:.3,y:0.5,w:.5,h:.5},
                ResultsHandler:{x:.8,y:.0,w:.2,h:1},
                NewspaperHandler:{x:.3,y:0,w:.5,h:.5},
                CountryHandler:{x:0,y:0,w:.3,h:1}

            };

            break;
        default:
            moduleString = "__countryHandler,__resultsHandler,__timelineHandler,__newspaperHandler";
            layout = {
                TimelineHandler:{x:.5,y:0.5,w:.5,h:.5},
                ResultsHandler:{x:0,y:.5,w:.5,h:.5},
                NewspaperHandler:{x:.5,y:0,w:.5,h:.5},
                CountryHandler:{x:0,y:0,w:.5,h:.5}

            };

    }
    res.render(page, {modules:moduleString, tabletop:tabletop, layout:layout, sessionID: sessionID});

}


