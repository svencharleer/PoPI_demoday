/**
 * Created by svenc on 17/06/15.
 */
var TimeLine = function()
{
    var BASEYEAR = 1600;
    var YEARS = 400;
    var _max = 10;
    var _name = "undefined";
    var _position = {x:100, y:100};
    var _size = {w:100,h:100};
    var _years = [];
    var _previousYears = [];
    var _tween;
    var _touchedLeft = undefined;
    var _touchedMiddle = undefined;
    var _touchedRight = undefined;
    var _handler;
    var _state = "neutral";
    var _subYears = [];
    var _selector = [0,YEARS];
    var _widthPerYear = 0;
    function drawWithColor(color)
    {
        var paddingBottom = 50;
        var paddingGraph = 1;



        var heightOfGraph = _size.h/6;
        //make it 400 years
        _widthPerYear = _size.w / YEARS;
        __p.pushMatrix();
            __p.translate(_position.x, _position.y);
            for(var i = 0; i < YEARS; i+=10)
            {
                var year = BASEYEAR+i;
                __p.pushMatrix()

                __p.translate(i * _widthPerYear,_size.h-paddingBottom+5);
                __p.rotate(Math.PI/3);
                __p.fill(255);
                __p.textSize(8);
                __p.text(year,0,0);
                __p.popMatrix();
            }


            for(var i = 0; i < YEARS; i++)
            {
                var yearOffset = i;
                var year = i + BASEYEAR;
                var count = _years[year] != undefined ? _years[year] : 0;
                var prevCount = (_previousYears != undefined && _previousYears[year] != undefined) ? _previousYears[year] : 0;

                //if out of range of selector, make grey
                if(_selector[0] > yearOffset * _widthPerYear || _selector[1] < yearOffset * _widthPerYear )
                    __p.fill(255);
                else
                    __p.fill(color);
                __p.noStroke();

                var logCount = count > 0 ? Math.log(count) : 0;
                var logprevCount = prevCount > 0 ? Math.log(prevCount) : 0;
                var height = logCount/_max * heightOfGraph;
                var previousHeight = logprevCount/_max * heightOfGraph;
                height = (_tween) * height + (1.0-_tween) * previousHeight;
                __p.rectMode(__p.CORNERS);
                __p.rect(yearOffset * _widthPerYear,_size.h-paddingBottom, (yearOffset+1) * _widthPerYear-paddingGraph, _size.h - height -paddingBottom);

            };
        __p.popMatrix();
    }
    function drawSelector()
    {
        __p.pushMatrix();
            __p.rectMode(__p.CORNERS);
            __p.translate(_position.x, _position.y);
            __p.stroke(parseInt(colors[3]))
            var width = (_selector[1] - _selector[0])/5;


            __p.noStroke();
            __p.fill(0xCCADADB2);
            __p.rect(_selector[0],0, _selector[0] + width, _size.h);
            __p.stroke(parseInt(colors[1]))
            __p.line(_selector[0],0, _selector[0] + width, 0);
            __p.textFont(__fontHeavy);
            __p.textSize(32);
            __p.text(parseInt(1600+_selector[0]/_widthPerYear),_selector[0],0 );


            __p.noStroke();
            __p.fill(0xCC848488);
            __p.rect(_selector[0]  + width,0, _selector[1] - width, _size.h);
            __p.stroke(parseInt(colors[2]))
            __p.line(_selector[0]  + width,0, _selector[1] - width, 0);

            __p.noStroke();
            __p.fill(0xCCADADB2);
            __p.rect(_selector[1]  - width,0, _selector[1], _size.h);
            __p.stroke(parseInt(colors[3]))
            __p.line(_selector[1]  - width,0, _selector[1],0);
            __p.text(parseInt(1600+_selector[1]/_widthPerYear),_selector[1]-80,0 );



        __p.popMatrix();
    }


    return {
        "init" : function(x,y,w,h, years, handler, reset)
        {
            _position.x = x;
            _position.y = y;
            _size.w = w;
            _size.h = h;
            _tween = 0;
            _previousYears = JSON.parse(JSON.stringify(_years));
            _years = JSON.parse(JSON.stringify(years));
            _handler = handler;
            console.log(JSON.stringify(_previousYears));
            //if(reset == true)
            {
                _selector = [0,_size.w];
            }
            _widthPerYear = _size.w / YEARS;
        },
        "sub":function(years)
        {
            _subYears = years;
        },

        "touch" : function(touches) {
            //only update when we let go
            //if it's full width, select small section around finger
            //split in 3 parts, move, enlarge left enlarge right
            if(_touchedLeft != undefined)
                _touchedLeft.alive = false;
            if(_touchedRight != undefined)
                _touchedRight.alive = false;
            if(_touchedMiddle != undefined)
                _touchedMiddle.alive = false;

            //old touches
            Object.keys(touches).some(function (t) {
                var touch = touches[t];
                var ids = [_touchedLeft != undefined ? _touchedLeft.id : -1,
                        _touchedRight != undefined ? _touchedRight.id : -1,
                        _touchedMiddle!= undefined ? _touchedMiddle.id : -1
                        ];
                switch(touch.id)
                {
                    case ids[2]:
                        console.log(touch.x,_touchedMiddle.x);
                        _touchedMiddle.xChange = touch.x - _touchedMiddle.x;
                        _touchedMiddle.x = touch.x;

                        _touchedMiddle.alive = true;
                        console.log("MIDDLE STILL EXISTS");

                        break;
                    case ids[0]:
                        _touchedLeft.xChange = touch.x - _touchedLeft.x;
                        _touchedLeft.x = touch.x;
                        _touchedLeft.alive = true;
                        console.log("LEFT STILL EXISTS");

                        break;
                    case ids[1]:
                        _touchedRight.xChange = touch.x - _touchedRight.x;
                        _touchedRight.x = touch.x;
                        _touchedRight.alive = true;
                        console.log("RIGHT STILL EXISTS " + _touchedRight.x);

                        break;

                }
                if (_touchedLeft != undefined && _touchedRight != undefined && _touchedMiddle != undefined &&_touchedLeft.alive && _touchedRight.alive && _touchedMiddle.alive)
                    return true;
            });
            Object.keys(touches).some(function (t) {
                var touch = touches[t];
                //skip when a touch is being handled already
                var ids = [_touchedLeft != undefined ? _touchedLeft.id : -1,
                        _touchedRight != undefined ? _touchedRight.id : -1,
                        _touchedMiddle!= undefined ? _touchedMiddle.id : -1
                ];
                if(ids.indexOf(touch.id) >= 0) return;

                if (_touchedLeft == undefined ) {
                    //find if there's a left touch
                    var widthLeftArea = ((_selector[1] - _selector[0]) / 5);
                    var leftArea = [_selector[0] + _position.x, _selector[0] +widthLeftArea  + _position.x];
                    if (touch.x >= leftArea[0]  && touch.x <= leftArea[1]) {
                        _touchedLeft = JSON.parse(JSON.stringify(touch));
                        _touchedLeft.alive = true;
                        _touchedLeft.xChange = 0;
                        console.log("LEFT");
                    }

                }
                if (_touchedRight == undefined) {
                    //find if there's a right touch
                    var widthRightArea = ((_selector[1] - _selector[0]) / 5);
                    var rightArea = [_selector[1] - widthRightArea + _position.x, _selector[1] + _position.x ];
                    if (touch.x >= rightArea[0] && touch.x <= rightArea[1]) {
                        _touchedRight = JSON.parse(JSON.stringify(touch));
                        _touchedRight.alive = true;
                        _touchedRight.xChange = 0;
                        console.log("RIGHT");
                    }

                }
                if (_touchedMiddle == undefined) {
                    //find if there's a middle touch
                    var widthMiddleArea = ((_selector[1] - _selector[0]) / 5);
                    var rightArea = [_selector[0] + widthMiddleArea + _position.x, _selector[1] - widthMiddleArea + _position.x];
                    if (touch.x >= rightArea[0] && touch.x <= rightArea[1]) {
                        _touchedMiddle = JSON.parse(JSON.stringify(touch));
                        _touchedMiddle.alive = true;
                        _touchedMiddle.xChange = 0;
                        console.log("MIDDLE");
                    }

                }


            });
            if (_touchedLeft != undefined && _touchedLeft.alive) {
                _selector[0] += _touchedLeft.xChange;

            }
            if (_touchedRight != undefined && _touchedRight.alive) {
                _selector[1] += _touchedRight.xChange;
            }
            if (_touchedMiddle != undefined &&_touchedMiddle.alive) {


                _selector[0] += _touchedMiddle.xChange;
                _selector[1] += _touchedMiddle.xChange;


            }

            //end of screen left selector
            if(_selector[0] < 0)
                _selector[0] = 0;
            if(_selector[0] + 200 > YEARS * _widthPerYear)
                _selector[0] = YEARS * _widthPerYear - 200;
            //size of selector
            if(_selector[1] - _selector[0] < 200)
                _selector[1] +=  200 - (_selector[1] - _selector[0]);
            //end of screen right selector
            if(_selector[1] > YEARS * _widthPerYear)
                _selector[1] = YEARS * _widthPerYear;


            var wasAnythingAlive = false;
            if (_touchedLeft != undefined && !_touchedLeft.alive) {
                _touchedLeft = undefined;
                //console.log("left gone");
                wasAnythingAlive = true;
            }
            if (_touchedRight != undefined && !_touchedRight.alive) {
                _touchedRight = undefined;
                //console.log("right gone");
                wasAnythingAlive = true;
            }
            if (_touchedMiddle != undefined && !_touchedMiddle.alive) {
                _touchedMiddle = undefined;
                //console.log("middle gone");
                wasAnythingAlive = true;
            }
            //only update if none are touched, but one just was let go
            if (wasAnythingAlive && _touchedLeft == undefined && _touchedRight == undefined && _touchedMiddle == undefined)
                _handler.callbackHandler(_selector);
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
            /*var color = tinycolor("#1EB0D3").toHsv();
            color.v = color.v * (.3 +  ((nrOfLayers - layerIndex)/nrOfLayers) *.7);
            var rgb = tinycolor(color).toRgb();
            drawWithColor(__p.color(rgb.r, rgb.g, rgb.b));*/
            drawSelector();
            drawWithColor(parseInt(colors[layerIndex]));

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
        var w = $(window).width();
        var h = $(window).height();
        _timelines[layer].init(w *.1,h *.1, w - w *.2,h - h *.2,years, _this);
    }

    return {
        "update": function(data)
        {
            updateLayer(getWidgetSpecificData("year", data[0]).Facets[0]["YEAR"],0,this);
            if(data.length == 1) {
                while(_timelines.length > 1)
                {
                    _timelines.splice(1,1);

                }

                return;
            }
            var layers = 1;
            for(var i=1;i<=layers&&i<data.length;i++)
            {
                updateLayer(getWidgetSpecificData("year", data[data.length-i]).Facets[0]["YEAR"], i,this);
            }






        },
        "callbackHandler" : function()
        {

        },
        "activeLayer":function()
        {
            return _timelines;
        },
        "draw":function(){

            if(_timelines.length > 0)
            {
                _timelines[0].animate();
                _timelines[0].draw(0, _timelines.length);
            }

            for(var i = _timelines.length-1;i>0;i--)
            {
                _timelines[i].animate();
                _timelines[i].draw(i, _timelines.length);
            }

        }


    }
}

var __timelineHandler = new TimelineHandler();

