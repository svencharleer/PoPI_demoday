/**
 * Created by svenc on 17/06/15.
 */
var TimeLine = function()
{

    var _name = "undefined";
    var _position = {x:100, y:100};
    var _years = [];
    var _previousYears = [];
    var _tween;
    var _touched = undefined;
    var _handler;
    var _state = "neutral";


    return {
        "init" : function( years, handler)
        {
            _tween = 0;
            _previousYears = _years;
            _years = years;
            _handler = handler;
        },

        "isTouched" : function(touch){
            if (__p.dist(touch.x, touch.y, _position.x, _position.y) < 22) {

                return true;
            }
            return false;
        },
        "touch" : function(touch)
        {


        },
        "update" : function()
        {
            if(_tween < 1.0)
            {
                _tween += .05;
            }
        },
        "draw" : function()
        {
            var paddingBottom = 50;
            var paddingGraph = 1;


            var screenWidth =  $("#" + __canvas).width();
            var screenHeight = $("#" + __canvas).height()
            var heightOfGraph = screenHeight/6;
            //make it 400 years
            var widthPerYear = screenWidth / 400;
            var vals = [];
            Object.keys(_years).forEach(function(k){
                    vals.push(_years[k]);
                }
            )
            var prevVals = [];
            Object.keys(_previousYears).forEach(function(k){
                    prevVals.push(_previousYears[k]);
                }
            )
            var max = Math.max.apply(Math, vals);
            var previousMax = Math.max.apply(Math, prevVals);
            for(var i = 0; i < 400; i+=10)
            {
                var year = 1600+i;
                __p.pushMatrix()

                __p.translate(i * widthPerYear,screenHeight-paddingBottom);
                __p.rotate(Math.PI/2);
                __p.textSize(8);
                __p.text(year,0,0);
                __p.popMatrix();
            }


            Object.keys(_years).forEach(function(d){
                var year = parseInt(d);
                var yearOffset = year - 1600;
                var count = _years[d];
                var prevCount = (_previousYears != undefined && _previousYears[d] != undefined) ? _previousYears[d] : 0;
                __p.fill(0xCC1EB0D3);
                __p.noStroke();
                __p.rectMode(__p.CORNERS);
                var height = count/max * heightOfGraph;
                var previousHeight = prevCount/previousMax * heightOfGraph;
                height = (_tween *_tween) * height + (1.0-_tween)*(1.0-_tween) * previousHeight;
                __p.rect(yearOffset * widthPerYear,screenHeight-paddingBottom, (yearOffset+1) * widthPerYear-paddingGraph, screenHeight - height -paddingBottom);


            });
        }

    }
}
var TimelineHandler = function()
{
    var _timeline = new TimeLine();

    return {
        "update": function(data)
        {
            var _this = this;


            var years = data[0]["YEAR"];
            _timeline.init(years, _this);
        },
        "callbackHandler" : function()
        {

        },
        "timeline" : function()
        {
            return _timeline;
        }


    }
}

var __timelineHandler = new TimelineHandler();

