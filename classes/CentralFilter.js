/**
 * Created by svenc on 17/06/15.
 */
var paperLib = require('../classes/libCalls.js');

    //every filter layer has either facet or query
var Filter = function()
{
    var _queries = "";
    var _facets = {};
    var _data = undefined;

    return {
        "initWithFacet" : function(facet, filter) //facet : {facetType, facetValue}
        {
            _queries = JSON.parse(JSON.stringify(filter.queries()));//copy by value

            var facets = JSON.parse(JSON.stringify(filter.facets())); //copy by value
            if(facets[facet.facetType] == undefined)
                facets[facet.facetType] = [];

            facets[facet.facetType].push(facet.facetValue);
            _facets = facets;

        },
        "initWithoutFacet" : function(facet, filter) //facet : {facetType, facetValue}
        {
            _queries = JSON.parse(JSON.stringify(filter.queries()));

            var facets = JSON.parse(JSON.stringify(filter.facets())); //copy by value
            if(facets[facet.facetType] == undefined)
                facets[facet.facetType] = [];
            //remove facetValue
            var i = facets[facet.facetType].indexOf(facet.facetValue);
            if(i>=0)
                facets[facet.facetType].splice(i,1);
            if(facets[facet.facetType].length == 0)
            {
                facets[facet.facetType] = null;
                delete facets[facet.facetType];
            }
            _facets = facets;

        },
        "initWithQuery" : function(query, filter)
        {
            var queries = JSON.parse(JSON.stringify(filter.queries()));
            queries += " " + query;
            _queries = queries;

            var facets = JSON.parse(JSON.stringify(filter.facets())); //copy by value
            _facets = facets;

        },
        "initWithoutQuery" : function(query, filter)
        {
            var queries = JSON.parse(JSON.stringify(filter.queries()));
            queries= queries.replace(query,"");
            _queries = queries;

            var facets = JSON.parse(JSON.stringify(filter.facets())); //copy by value
            _facets = facets;

        },
        "facets": function() {return _facets;},
        "queries": function() {return _queries;},
        "data":function(data) {_data = data;},
        "getData":function() {return _data;}

    }
}


var CentralFilter = function()
{
    var _filterStack = [new Filter()]; //keep history, so people can jump back?
    //blue indicates last filter, pink current?


    function getActivity() {

        var r = [];
        _filterStack.forEach(function(f){
            r.push({queries: f.queries(),
                facets: f.facets(),
                data: f.getData()});
        });
        return r;


    }
    function getLastFilter()
    {

        return _filterStack[_filterStack.length-1]
    }



    return {
        "newFilter_Query" : function(query)
        {
            var filter = new Filter();
            filter.initWithQuery(query, getLastFilter());
            _filterStack.push(filter);
        },
        "newFilter_Facet" : function(facetType, facetValue)
        {
            var filter = new Filter();
            filter.initWithFacet({facetType:facetType, facetValue:facetValue}, getLastFilter());
            _filterStack.push(filter);
        },
        "disableFilter_Query" : function(query)
        {
            var filter = new Filter();
            filter.initWithoutQuery(query, getLastFilter());
            _filterStack.push(filter);
        },
        "disableFilter_Facet" : function(facetType, facetValue)
        {
            var filter = new Filter();
            filter.initWithoutFacet({facetType:facetType, facetValue:facetValue}, getLastFilter());
            _filterStack.push(filter);
        },
        "systemCall" : function(callback, layer)
        {
            paperLib.filteredQuery(getLastFilter(), function(data) {
                getLastFilter().data(data);
                callback(getActivity());

            });
            //STORE THE RESULT AT THE FILTER LEVEL TOO

        },
        "reset" : function()
        {
            _filterStack = [new Filter()];

        },
        "save" : function()
        {
            //send stack to server to store in mongo?
        },
        "filterStack" : function()
        {
            return getActivity();
        }






    }
}

exports.__centralFilter = new CentralFilter();
/*
// tests
exports.__centralFilter.reset();
exports.__centralFilter.newFilter_Query("hitler");
//exports.__centralFilter.systemCall(function(d){console.log(d.facets(), d.queries(), d.data())});
exports.__centralFilter.newFilter_Facet("YEAR", 1940);
//exports.__centralFilter.systemCall(function(d){console.log(d.facets(), d.queries(), d.data())});
exports.__centralFilter.newFilter_Facet("YEAR", 1941);
//exports.__centralFilter.systemCall(function(d){console.log(d.facets(), d.queries(), d.data())});
exports.__centralFilter.newFilter_Facet("COUNTRY", "FRA");
//exports.__centralFilter.systemCall(function(d){console.log(JSON.stringify(d))});
//exports.__centralFilter.disableFilter_Facet("YEAR", 1941);
//exports.__centralFilter.systemCall(function(d){console.log(d.facets(), d.queries(), d.data())});
exports.__centralFilter.disableFilter_Query("hitler");
exports.__centralFilter.systemCall(function(d){console.log(JSON.stringify(d))});
    */