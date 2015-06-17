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
        "isTouched" : function(touch){
            if (__p.dist(touch.x, touch.y, _position.x, _position.y) < 22) {

                return true;
            }
            return false;
        },
        "touch" : function(touch)
        {
            //first touch
            if(_touched == undefined) {
                _touched = touch;
                console.log("touched");
                _handler.callbackHandler(_countryCode, "on");
                return;
            }
            if(_touched.id == touch.id)
                return;
            _handler.callbackHandler(_countryCode, "off");
            _touched = undefined; //this object is on/off


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
            var countries = data[2]["COUNTRY"];
            Object.keys(countries).forEach(function(c) {

                var country = new CountryResults();
                if(countryAbbrToName[c] == undefined) return; //
                country.init(countryAbbrToName[c], c,
                    {x: countryToScreenCoordinates[c].x, y: countryToScreenCoordinates[c].y},
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

