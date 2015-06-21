/**
 * Created by svenc on 17/06/15.
 */
var TimeLine = function()
{

    var _max = 10;
    var _name = "undefined";
    var _position = {x:100, y:100};
    var _years = [];
    var _previousYears = [];
    var _tween;
    var _touched = undefined;
    var _handler;
    var _state = "neutral";
    var _subYears = [];
    function drawWithColor(color)
    {
        var paddingBottom = 50;
        var paddingGraph = 1;


        var screenWidth =  $("#" + __canvas).width();
        var screenHeight = $("#" + __canvas).height()
        var heightOfGraph = screenHeight/6;
        //make it 400 years
        var widthPerYear = screenWidth / 400;
        /*var vals = [];
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
        */
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


        for(var i = 0; i < 400; i++)
        {

            var yearOffset = i;
            var year = i + 1600;
            var count = _years[year] != undefined ? _years[year] : 0;
            var prevCount = (_previousYears != undefined && _previousYears[year] != undefined) ? _previousYears[year] : 0;

            __p.fill(color);
            __p.noStroke();
            __p.rectMode(__p.CORNERS);
            var logCount = count > 0 ? Math.log(count) : 0;
            var logprevCount = prevCount > 0 ? Math.log(prevCount) : 0;
            var height = logCount/_max * heightOfGraph;
            var previousHeight = logprevCount/_max * heightOfGraph;
            height = (_tween) * height + (1.0-_tween) * previousHeight;
            __p.rect(yearOffset * widthPerYear,screenHeight-paddingBottom, (yearOffset+1) * widthPerYear-paddingGraph, screenHeight - height -paddingBottom);

        };

    }

    return {
        "init" : function( years, handler)
        {
            _tween = 0;
            _previousYears = JSON.parse(JSON.stringify(_years));
            _years = JSON.parse(JSON.stringify(years));
            _handler = handler;
            console.log(JSON.stringify(_previousYears));
        },
        "sub":function(years)
        {
            _subYears = years;
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
        "animate" : function()
        {
            if(_tween < 1.0)
            {
                _tween += .05;
            }
        },

        "draw" : function(layerIndex, nrOfLayers)
        {
            var color = tinycolor("#1EB0D3").toHsv();
            color.v = color.v * (.3 +  ((nrOfLayers - layerIndex)/nrOfLayers) *.7);
            var rgb = tinycolor(color).toRgb();
            drawWithColor(__p.color(rgb.r, rgb.g, rgb.b));
        }


    }
}
var TimelineHandler = function()
{
    var _timelines = [];
    socket.on("subQueryResult_Timeline", function(data){
        var years = data.Facets[0]["YEAR"];
        _timeline.sub(years);
    });
    function updateLayer(years, layer,_this)
    {

        if(_timelines[layer] == undefined)
            _timelines[layer] = new TimeLine();
        _timelines[layer].init(years, _this);
    }

    return {
        "update": function(data)
        {
            if(data.length > 2) {
                updateLayer(data[data.length - 3].data.Facets[0]["YEAR"], 2,this);
            }
            if(data.length > 1) {
                updateLayer(data[data.length - 2].data.Facets[0]["YEAR"], 1,this);
            }
            updateLayer(data[data.length - 1].data.Facets[0]["YEAR"],0,this);




        },
        "callbackHandler" : function()
        {

        },
        "activeLayer":function()
        {
            if(_timelines.length > 0)
                return _timelines[0];
            return [];
        },
        "draw":function(){
            for(var i = _timelines.length-1;i>=0;i--)
            {
                _timelines[i].animate();
                _timelines[i].draw(i, _timelines.length);

            }

        }


    }
}

var __timelineHandler = new TimelineHandler();

