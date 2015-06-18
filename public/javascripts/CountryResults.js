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
        "draw" : function()
        {
            __p.rectMode(__p.CORNERS);
            var x = _position.x;
            var y = _position.y;
            var count = _results.count;
            switch(_state){
                case "neutral":
                    __p.fill(255);
                    break;
                case "fade":
                    __p.fill(150);
                    break;
                case "highlight":
                    __p.fill(255);
                    break;
            }

            __p.text(_name, x-10,y-17);
            switch(_state){
                case "neutral":
                    __p.fill(0xCCFB3A9A);
                    break;
                case "fade":
                    __p.fill(100);
                    break;
                case "highlight":
                    __p.fill(0xCCFB3A9A);
                    break;
            }

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

    }
}
var CountryHandler = function()
{
    var _countries = [];

    return {
        "update": function(data)
        {
            var _this = this;
            _countries = [];
            //country results
            var countries = data.Facets[1]["LANGUAGE"];
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
                _countries.push(country);
            });
        },
        "callbackHandler" : function(countryCode, onOff)
        {
            if(onOff == "on")
            {
                _countries.forEach(function(c){
                    if(c.countryCode() != countryCode)
                        c.fade();
                    else
                        c.highlight();
                });
                //that takes care of the visual
                //send this select to the other components
                __timelineHandler.subsetCall("language", countryCode);
            }
            else
            {
                _countries.forEach(function(c){
                    c.neutral();
                });
            }
        },
        "countries" : function()
        {
            return _countries;
        }


    }
}

var __countryHandler = new CountryHandler();

