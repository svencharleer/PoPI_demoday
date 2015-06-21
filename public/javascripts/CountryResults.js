/**
 * Created by svenc on 17/06/15.
 */

//var colors = ["0xCCFF3E3E","0xCC7C4EE8","0xCC33F0FF","0xCC91E870","0xCCFFE085"];
var colors = ["0xCCFF358B","0xCC01B0F0","0xCCAEEE00","0xCCDC9EE8","0xCCFF5FD1"];
var otherFilters = function(exclude,data)
{
    var filters = [];
    data.forEach(function(layer) {
        try {
            layer.data.some(function (d) {
                if (d.exclude != exclude && d.exclude != "") {
                    filters.push(d.exclude)

                }

            })
            if (layer.queries.length > 0) filters.push("query");
        }
        catch(exc)
        {
            console.log("otherFilters: layer does not contain data, sync prob?");
            console.log(exc);
        }

    });
    return filters;
}
var getWidgetSpecificData = function(exclude,data)
{
    var myData = {};
    try {
        data.data.some(function (d) {
            if (d.exclude == exclude) {
                myData = d.result;

                return true;
            }
            if (d.exclude == "")
                myData = d.result;
        })
    }
    catch(exc)
    {
        console.log("getWidgetSpecificData: data empty, sync prob?");
        console.log(exc);
    }
    return myData;
}

var CountryResults = function()
{

    var _name = "undefined";
    var _position = {x:100, y:100};
    var _results = {count:0, query:"undefined"};
    var _touched = undefined;
    var _handler;
    var _state = "neutral";
    var _countryCode;
    var _prevCount = 0;
    var _tween = 0;

    function drawPapersWithColor(color)
    {
        __p.rectMode(__p.CORNERS);
        var x = _position.x;
        var y = _position.y;
        var count = _results.count;
        __p.fill(255);
        __p.text(_name, x-10,y-17);
        __p.fill(color);

        __p.stroke(255);
        __p.text(count, x-10,y-5);
        var baseX = x;
        var baseY = y;
        var nrOfSheets = count/50;
        for(var i = 0; i < nrOfSheets;i++)
        {
            if(i >= 30) {

                x = baseX;
                y = baseY+26;
                __p.rect(x, y,x+5,y+5);
                x+=7;
                __p.rect(x, y,x+5,y+5);
                x+=7;
                __p.rect(x, y,x+5,y+5);
                return;
            }

            __p.rect(x, y,x+10,y+15);
            if(i%5 == 0 && i > 0){
                x+=20;
                y= baseY;
            }
            if(i%15 == 0 && i > 0)
            {
                x = baseX;
                y = baseY + 23;
                baseY = y;

            }
            x++;y++;

        }
    }
    function drawWithColor(color)
    {
        var x = _position.x;
        var y = _position.y;
        var count = _tween * _results.count + (1.0-_tween) * _results.prevCount;

        var surface = Math.log(count)*1000;
        var radius = Math.sqrt((surface/Math.PI));

        __p.fill(color);

        __p.noStroke();
        __p.ellipse(x,y,radius,radius);

        __p.fill(255);
        __p.text(_name, x-10,y-17);
        __p.fill(color);

        __p.stroke(255);
        __p.text(count, x-10,y-5);

    }


    return {
        "init" : function(name, countryCode, position, results, handler)
        {
            _name = name;
            _countryCode = countryCode;
            _position = position;
            _results = results;
            _handler = handler;
        },
        "countryCode" : function()
        {
            return _countryCode;
        },

        "touch" : function(touches)
        {
            var touchStillExists = false;
            Object.keys(touches).forEach(function(t){
                var touch = touches[t];
                if(_touched != undefined && _touched.id == touch.id) {
                    touchStillExists = true;
                    return true;
                }
                if (_touched == undefined && __p.dist(touch.x, touch.y, _position.x, _position.y) < 22) {


                        touchStillExists = true;
                        _touched = touch;
                        console.log("touched");
                        console.log(_state);

                        if(_state == "highlight")
                            _handler.callbackHandler(_countryCode, "off");
                        else
                            _handler.callbackHandler(_countryCode, "on");
                        return true;



                }
            })
            if(!touchStillExists) _touched = undefined;

        },
        "highlight" : function(){
            _state = "highlight";
        },
        "fade" : function(){
            _state = "fade";
        },
        "neutral" : function(){
            _state = "neutral";
        },
        "draw" : function(layerIndex, nrOfLayers)
        {
            /*var color = tinycolor("#FB3A9A").toHsv();
            color.h = color.h * (.3 +  ((nrOfLayers - layerIndex)/nrOfLayers) *.7);
            var rgb = tinycolor(color).toRgb();
            drawWithColor(__p.color(rgb.r, rgb.g, rgb.b));*/

            drawWithColor(parseInt(colors[layerIndex]));
        },
        "drawDim": function(layerIndex, nrOfLayers)
        {
            var color = tinycolor(colors[layerIndex].replace("0xCC","#")).toHsv();
             color.v = color.v * .3;
             var rgb = tinycolor(color).toRgb();
             drawWithColor(__p.color(rgb.r, rgb.g, rgb.b));

        },
        "count" : function(){return _results.count;},
        "animate" : function()
        {
            if(_tween < 1.0)
            {
                _tween += .05;
            }
        }


    }
}
var CountryHandler = function()
{
    var _countries = [];
    var _selectedCountries = [];
    var _otherFilters = [];

    function updateLayer(countries, layer,_this, original,previous) //oroginal added to support drawing of all countries on all layers, evn
    {

        _countries[layer] = [];
        Object.keys(original).forEach(function(c) {



            var country = new CountryResults();
            if(languageToCountryCode[c] == undefined)
            {
                console.log(c + " not found in language to countrycode");
                return;
            }
            var cc = languageToCountryCode[c];
            var count = 0;var prevCount =0;
            if(countries[c] != undefined)
                count = countries[c];
            if(previous[c] != undefined)
                prevCount = previous[c];
            country.init(__countriesToName[cc], c,
                {x: countryToScreenCoordinates[cc].x, y: countryToScreenCoordinates[cc].y},
                {count:count, prevCount:prevCount, query:""},
                _this);
            _countries[layer].push(country);

        });
    };
    return {
        "update": function(data)
        {


            var myData = getWidgetSpecificData("language", data[0]);
            _otherFilters = otherFilters("language", data); // see if there are other filters, needed for coloring correctly
            _countries = [];
            var originalLayer = myData.Facets[1]["LANGUAGE"];


            var previousLayer = {};
            if(data.length > 1)
                previousLayer = getWidgetSpecificData("language", data[data.length-2]).Facets[1]["LANGUAGE"];
            updateLayer(originalLayer,0,this,originalLayer,originalLayer);

            if(data.length > 1) {

                updateLayer(getWidgetSpecificData("language", data[data.length - 1]).Facets[1]["LANGUAGE"], 1, this,originalLayer,previousLayer);
            }





        },
        "callbackHandler" : function(countryCode)
        {
            //already selected?
            if(_selectedCountries.indexOf(countryCode) >= 0)
            {
                socket.emit("removeFilter_Facet", {facetType: "language", facetValue:countryCode });
                _selectedCountries.splice(_selectedCountries.indexOf(countryCode),1);
            }
            else
            {
                socket.emit("addFilter_Facet", {facetType: "language", facetValue:countryCode });
                _selectedCountries.push(countryCode);
            }
        },
        "activeLayer":function()
        {
            if(_countries.length > 0)
                return _countries[0];
            return [];
        },
        "draw":function() {
            var allCountries = {};
            for (var i = _countries.length - 1; i >= 0; i--) {
                _countries[i].forEach(function (country) {
                    // country.draw(i, _countries.length);
                    if (allCountries[country.countryCode()] == undefined)
                        allCountries[country.countryCode()] = [];
                    allCountries[country.countryCode()].push({c: country, i: i});
                })
            }
            Object.keys(allCountries).forEach(function (k) {
                //sort
                allCountries[k].sort(function (a, b) {
                    if (a.c.count() < b.c.count())
                        return 1;
                    if (a.c.count() > b.c.count())
                        return -1;
                    if (a.i < b.i)
                        return 1;
                    if (a.i > b.i)
                        return -1;
                    return 0;
                })
                allCountries[k].forEach(function (country, i, a) {
                    var color = 0;
                    if ((_selectedCountries.indexOf(country.c.countryCode()) >= 0 && i == _countries.length-1) ||
                        (_otherFilters.length > 0 && i == _countries.length-1)) //if it's the top layer we draw, and other filters active, all goes blue there
                        color = 1;
                    country.c.animate();

                    if (_selectedCountries.indexOf(country.c.countryCode()) >= 0 || _selectedCountries.length == 0)
                        country.c.draw(color, _countries.length);
                    else
                        country.c.drawDim(color, _countries.length);



                });


            });
        }


    }
}

var __countryHandler = new CountryHandler();

