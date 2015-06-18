/**
 * Created by svenc on 17/06/15.
 */
var Console = function()
{

    var _name = "undefined";
    var _position = {x:0, y:0};
    var _results = [];
    var _touched = undefined;
    var _handler;


    return {
        "init" : function(handler)
        {

            _handler = handler;
        },
        "sub" : function(results)
        {
            _results = results;
        },


        "isTouched" : function(touch){
        },
        "touch" : function(touch)
        {


        },
        "draw" : function()
        {




            var screenHeight = $("#" + __canvas).height()
            var widthOfConsole = 200;
            __p.rectMode(__p.CORNERS);
            __p.noFill();
            __p.stroke(255);
            __p.rect(0,0,widthOfConsole,screenHeight);
            var x = _position.x;
            var y = _position.y;
            Object.keys(_results).forEach(function(d){


                __p.noStroke();
                __p.textSize(10);
                __p.fill(0xCCFB3A9A);
                __p.text(_results[d]["TITLE"][0],x,y,x+200, y+20);
                __p.fill(0xCC1EB0D3);
                __p.textSize(6);
                __p.text(_results[d]["URI"],x,y+7, x+200, y+20);
                y+=20;


            });
        }

    }
}
var ConsoleHandler = function()
{
    var _console = new Console();
    socket.on("subQueryResult_Timeline", function(data){
        var results = data.Results;
        _console.sub(results);
    });

    return {
        "update": function(data)
        {
            var _this = this;



            _console.init(_this);
        },
        "callbackHandler" : function()
        {

        },

        "console" : function()
        {
            return _console;
        }


    }
}

var __consoleHandler = new ConsoleHandler();

