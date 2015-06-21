/**
 * Created by svenc on 17/06/15.
 */
var CountryResults = function()
{

    var _name = "undefined";
    var _position = {x:100, y:100};
    var _results = {count:0, query:"undefined"};
    var _touched = undefined;
    var _handler;
    var _state = "neutral";
    var _countryCode;

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
        var count = _results.count;

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
            var color = tinycolor("#FB3A9A").toHsv();
            color.v = color.v * (.3 +  ((nrOfLayers - layerIndex)/nrOfLayers) *.7);
            var rgb = tinycolor(color).toRgb();
            drawWithColor(__p.color(rgb.r, rgb.g, rgb.b));
        }


    }
}
var CountryHandler = function()
{
    var _countries = [];
    var _selectedCountries = [];

    function updateLayer(countries, layer,_this)
    {

        _countries[layer] = [];
        Object.keys(countries).forEach(function(c) {



            var country = new CountryResults();
            if(languageToCountryCode[c] == undefined)
            {
                console.log(c + " not found in language to countrycode");
                return;
            }
            var cc = languageToCountryCode[c];
            country.init(__countriesToName[cc], c,
                {x: countryToScreenCoordinates[cc].x, y: countryToScreenCoordinates[cc].y},
                {count:countries[c], query:""},
                _this);
            _countries[layer].push(country);

        });
    };
    return {
        "update": function(data)
        {

            _countries = [];

            if(data.length > 2) {

                updateLayer(data[data.length - 3].data.Facets[1]["LANGUAGE"], 2, this);
            }
            if(data.length > 1) {

                updateLayer(data[data.length - 2].data.Facets[1]["LANGUAGE"], 1, this);
            }
            updateLayer(data[data.length - 1].data.Facets[1]["LANGUAGE"],0,this);




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
        "draw":function(){
            for(var i = _countries.length-1;i>=0;i--)
            {
                _countries[i].forEach(function(country){
                    country.draw(i, _countries.length);
                })
            }

        }



    }
}

var __countryHandler = new CountryHandler();

