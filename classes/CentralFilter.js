/**
 * Created by svenc on 17/06/15.
 */
var paperLib = require('../classes/libCalls.js');

    //every filter layer has either facet or query
var Filter = function()
{
    var _query = undefined;
    var _facet =undefined;
    var _enabled = true;
    return {
        "initFacet" : function(facet)
        {
            _facet = facet;

        },
        "initQuery" : function(query)
        {
            _query = query;

        },
        "facet": function() {return _facet;},
        "query": function() {return _query;},
        "disable": function() {_enabled = false;},
        "enabled": function() {return _enabled;}
    }
}


var CentralFilter = function()
{
    var _filterStack = []; //keep history, so people can jump back?
    //blue indicates last filter, pink current?

    function getQuery(query){
        var facet = undefined;
        _filterStack.forEach(function(f){
            if(f.query() != undefined && f.query() == query)
            {
                facet = f;
                return true;
            }
        })
        return facet;
    }
    function getFacet(facetType, facetValue){
        var facet = undefined;
        _filterStack.forEach(function(f){
            if(f.facet() != undefined && f.facet().facetType == facetType && f.facet().facetValue == facetValue) {

                facet = f;
                return true;
            }

        })
        return facet;
    }
    function getAndGroupActiveQueries(layer)
    {
        var r = [];
        for(var i = 0; i <= layer; i++)
        {
            if(_filterStack[i].query() != undefined && _filterStack[i].enabled())
                r.push(_filterStack[i].query());
        }
        return r;
    }
    function getAndGroupActiveFacets(layer)
    {
        var r = {};
        for(var i = 0; i <= layer; i++)
        {
            if(_filterStack[i].facet() != undefined && _filterStack[i].enabled())
            {
                if(r[_filterStack[i].facet().facetType] == undefined)
                    r[_filterStack[i].facet().facetType] = [];
                r[_filterStack[i].facet().facetType].push(_filterStack[i].facet().facetValue);
            }
        }
        return r;
    }
    function getQueries(layer){
        var r = [];
        for(var i = 0; i <= layer; i++)
        {
            if(_filterStack[i].query() != undefined)
                r.push({query: _filterStack[i].query(), enabled: _filterStack[i].enabled()});
        }
        return r;
    }
    function getFacets(layer){
        var r = [];
        for(var i = 0; i <= layer; i++)
        {
            if(_filterStack[i].facet() != undefined)
                r.push({facet:_filterStack[i].facet(), enabled: _filterStack[i].enabled()});
        }
        return r;
    }
    function printActivity(layer) {
        //get all facets, and their values, group them and ignore disabled ones
        if(layer == undefined)
            layer = _filterStack.length-1;
        //call with last query
        var queries = getQueries(layer); //this gets all of them
        var facets = getFacets(layer); // this gets all of them
        console.log("q " + JSON.stringify(queries));
        console.log("f " + JSON.stringify(facets));


    }
    function groupForCall(layer) {
        //get all facets, and their values, group them and ignore disabled ones
        if(layer == undefined)
            layer = _filterStack.length-1;
        //call with last query
        var queries = getAndGroupActiveQueries(layer); //this gets all of them
        var facets = getAndGroupActiveFacets(layer); // this gets all of them
        console.log("q " + JSON.stringify(queries));
        console.log("f " + JSON.stringify(facets));
        return {queries: queries, facets: facets};


    }

    return {
        "newFilter_Query" : function(query)
        {
            var filter = new Filter();
            filter.initQuery(query);
            _filterStack.push(filter);
        },
        "newFilter_Facet" : function(facetType, facetValue)
        {
            var filter = new Filter();
            filter.initFacet({facetType:facetType, facetValue:facetValue});
            _filterStack.push(filter);
        },
        "disableFilter_Query" : function(query)
        {
            var q = getQuery(query);
            if(q != undefined)
                q.disable();
        },
        "disableFilter_Facet" : function(facetType, facetValue)
        {
            var f = getFacet(facetType, facetValue);

            if(f!= undefined) {

                f.disable();
            }
        },
        "systemCall" : function(callback, layer)
        {
            var call = groupForCall(layer);
            paperLib.filteredQuery(call, callback);
            //STORE THE RESULT AT THE FILTER LEVEL TOO

        },
        "reset" : function()
        {
            _filterStack = [];
        },
        "save" : function()
        {
            //send stack to server to store in mongo?
        },
        "filterStack" : function()
        {
            return _filterStack;
        }






    }
}

exports.__centralFilter = new CentralFilter();

// tests
/*
exports.__centralFilter.newFilter_Query("hitler");
exports.__centralFilter.newFilter_Facet("YEAR", 1940);
exports.__centralFilter.systemCall(function(d){console.log(JSON.stringify(d))});
exports.__centralFilter.newFilter_Facet("YEAR", 2099);
exports.__centralFilter.newFilter_Facet("COUNTRY", "FRA");
exports.__centralFilter.systemCall(function(d){console.log(JSON.stringify(d))});
exports.__centralFilter.disableFilter_Facet("YEAR", 2099);
exports.__centralFilter.systemCall(function(d){console.log(JSON.stringify(d))});
exports.__centralFilter.disableFilter_Query("test1");
exports.__centralFilter.systemCall(function(d){console.log(JSON.stringify(d))});
*/