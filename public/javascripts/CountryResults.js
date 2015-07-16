/**
 * Created by svenc on 17/06/15.
 */

//var colors = ["0xCCFF3E3E","0xCC7C4EE8","0xCC33F0FF","0xCC91E870","0xCCFFE085"];
var colors = ["0xCCFF358B","0xCC01B0F0","0xCCAEEE00","0xCCDC9EE8","0xCCFF5FD1"];

var __imgCountrySelect = undefined;

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
    var _guid;
    var _this;
    function x(){
        return _position.x * _handler.scale() + _handler.offset().x;
    }
    function y(){
        return _position.y * _handler.scale() + _handler.offset().y;
    }
    function drawPapersWithColor(color)
    {
        __p.rectMode(__p.CORNERS);
        var x = _position.x;
        var y = _position.y;
        var count = _results.count;
        __p.fill(255);
        __p.textFont(__fontThin);

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
    function drawWithColor(color,layerIndex,selected)
    {
        var x = _position.x;
        var y = _position.y;
        var count = _tween * _results.count + (1.0-_tween) * _results.prevCount;
        if(count < 0) count = 0;
        var surface = count/_handler.max() * 5000;
        var radius = Math.sqrt((surface/Math.PI));

        __p.fill(color);

        __p.noStroke();
        __p.ellipse(x,y,radius,radius);

        //only draw country name once
        if(layerIndex == 0)
        {
            if(selected)
            {
                __p.pushMatrix()
                __p.translate(x-__imgCountrySelect.width/4,y-__imgCountrySelect.height/4)
                __p.scale(.5)
                __p.image(__imgCountrySelect,0,0)
                __p.popMatrix()
            }


        }
        __p.fill(255);
        __p.textFont(__fontThin);
        __p.textSize(12);
        __p.textAlign(__p.CENTER,__p.TOP)
        __p.text(_name, x-50, y-44,100,15);
        __p.stroke(255)
        if(!selected) {
            __p.line(x, y - 10, x, y - 30)
            __p.line(x - 10, y - 30, x + 10, y - 30)
        }
        __p.textFont(__fontHeavy);
        __p.textSize(12);
        var offset = 55;
        if(layerIndex != 0) {
            offset = 65;

            __p.textSize(12);
        }
        __p.fill(color);
        __p.text(parseInt(count), x-50,y-offset,100,15);

    }


    return {
        "init" : function(name, countryCode, position, results, handler)
        {
            _name = name;
            _countryCode = countryCode;
            _position = position;
            _results = results;
            _handler = handler;
            _guid = guid();
            _this = this;
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
                if (_touched == undefined && __p.dist(touch.x, touch.y, x(), y()) < 22) {


                        touchStillExists = true;
                        _touched = touch;
                        //own the touch!
                        touch.owner = _guid;
                        touch.ownerObject = _this;


                        return true;



                }
            })
            if(!touchStillExists) _touched = undefined;

        },
        "untouch": function(touch)
        {

            if (_touched != undefined && _touched.id == touch.id
                && __p.dist(touch.x, touch.y, x(), y()) < 22)

            {
                if(_state == "highlight")
                    _handler.callbackHandler(_countryCode, "off");
                else
                    _handler.callbackHandler(_countryCode, "on");

            }
            _touched = undefined;
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

            drawWithColor(parseInt(colors[layerIndex]),layerIndex, false);
        },
        "drawSelected": function(layerIndex, nrOfLayers)
        {
            /*var color = tinycolor(colors[layerIndex].replace("0xCC","#")).toHsv();
             color.v = color.v * .3;
             var rgb = tinycolor(color).toRgb();*/
             drawWithColor(parseInt(colors[layerIndex]),layerIndex, true);

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
    var _imgTitle;
    var _layout;
    var _offset = {x:0, y:0};
    var _scale;

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
            if(_max < count) _max = count;
            country.init(__countriesToName[cc], c,
                {x: countryToScreenCoordinates[cc].x, y: countryToScreenCoordinates[cc].y},
                {count:count, prevCount:prevCount, query:""},
                _this);
            _countries[layer].push(country);

        });
    };
    return {
        "init": function(layout)
        {
            _layout = layout;
            _scale = 1;
            _offset.x = _layout.x * __screenWidth;
            _offset.y = _layout.y * __screenHeight;
            var w = $(window).width()* _layout.w / _scale;
            var h = $(window).height()* _layout.h / _scale;
            $("#map").width(w);
            $("#map").height(h);


            if(__imgCountrySelect == undefined)
            {
                __imgCountrySelect = __p.loadImage("/ecloud/images/country_select.png");
            }
            if(_imgTitle == undefined)
            {
                _imgTitle = __p.loadImage("/ecloud/images/title_countries.png");
            }
        },

        "name": "CountryHandler",
        "update": function(data)
        {
            if(data.length == 1) //it's a reset, only one filter layer means show all, means reset has been hit
            {
                _selectedCountries = []
            }

            _max = 0;
            var myData = getWidgetSpecificData("language", data[0]);
            _otherFilters = otherFilters("language", data); // see if there are other filters, needed for coloring correctly
            _countries = [];
            var originalLayer = myData["LANGUAGE"];


            var previousLayer = {};
            if(data.length > 1)
                previousLayer = getWidgetSpecificData("language", data[data.length-2])["LANGUAGE"];
            updateLayer(originalLayer,0,this,originalLayer,originalLayer);

            if(data.length > 1) {

                updateLayer(getWidgetSpecificData("language", data[data.length - 1])["LANGUAGE"], 1, this,originalLayer,previousLayer);
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
            __p.pushMatrix()
            __p.translate(_offset.x,_offset.y);

            __p.scale(_scale);
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

                    if (_selectedCountries.indexOf(country.c.countryCode()) >= 0)
                        country.c.drawSelected(color, _countries.length);
                    else
                        country.c.draw(color, _countries.length);



                });
                __p.fill(0xCC0B0B0B)
                __p.noStroke();
                __p.rectMode(__p.CORNER)
                __p.rect(0,$(window).height()-50,__screenWidth, 50);
                /*__p.pushMatrix();
                __p.scale(.5)
                var h = $(window).height()*2;
                __p.image(_imgTitle, 10,h-100)
                */
                __p.popMatrix();


            });
        },
        "max": function(){return _max;},
        "boundingBox":function(){
            var w = $(window).width()* _layout.w;
            var h = $(window).height()* _layout.h;
            return {x1:_offset.x, x2:_offset.x + w, y1:_offset.y, y2: _offset.y + h};

        },
        "name": "CountryHandler",
        "offset": function(){return _offset;},
        "scale":function(){return _scale;},


    }
}

var __countryHandler = new CountryHandler();

