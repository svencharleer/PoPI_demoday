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
    var _wasAnythingAlive = false;
    var _this;
    var _guid;
    var _initialized = false;
    var _imgArrowLeft;
    var _imgArrowRight;
    function drawWithColor(color, layer)
    {
        var paddingBottom = 50;
        var paddingGraph = 1;

        _widthPerYear = _size.w / YEARS;
        __p.pushMatrix();
        __p.translate(_position.x, _position.y);
        if(layer == 0) {//draw axis
            __p.stroke(0xCC404853);
            __p.fill(0xCC5B6574);
            __p.textAlign(__p.LEFT, __p.CENTER)
            __p.textFont(__fontThin);
            __p.textSize(16);
            for (var i = 3; i >= 0; i--) {
                var h = i * (_size.h - paddingBottom) / 4;
                if (i != 0)__p.line(0, h, _size.w, h);
                var nr = (_size.h - h) / _size.h * _max;
                //nr = nr > 1 ? Math.log(nr) : (nr > 0 ? .05 : 0);
                __p.text(parseInt(nr), _size.w + 5, h)
            }
        }
        __p.textAlign(__p.LEFT,__p.BOTTOM)
        var heightOfGraph =  _size.h-paddingBottom;

        if(layer == 0) {
            __p.line(0, _size.h - paddingBottom, _size.w, _size.h - paddingBottom);
            __p.textFont(__fontThin);
            for (var i = 0; i < YEARS; i += 5) {
                var year = BASEYEAR + i;
                __p.pushMatrix()

                __p.translate(i * _widthPerYear, _size.h - paddingBottom + 10);
                //__p.rotate(Math.PI/3);
                __p.fill(255);

                if (i % 20 == 0) {
                    __p.stroke(255);
                    __p.line(0, -9, 0, -7);
                    __p.textSize(8);
                    __p.text(year, 0, 5);
                }
                else {
                    __p.stroke(0xCC404853);
                    __p.line(0, -9, 0, -9);
                }
                __p.popMatrix();
            }
        }

            for(var i = 0; i < YEARS; i++)
            {
                var yearOffset = i;
                var year = i + BASEYEAR;
                var count = _years[year] != undefined ? _years[year] : 0;
                var prevCount = (_previousYears != undefined && _previousYears[year] != undefined) ? _previousYears[year] : 0;

                //if out of range of selector, make grey
                if(_selector[0] > yearOffset * _widthPerYear || _selector[1] < yearOffset * _widthPerYear )
                {
                    __p.fill(layer == 0 ? 0xCC8190A4 : 0xCCADBED1);
                }
                else
                    __p.fill(color);
                __p.noStroke();

               /*var logCount = count > 1 ? Math.log(count) : (count > 0 ? .05 : 0);
               var logprevCount = prevCount > 1 ? Math.log(prevCount) : (prevCount > 0 ? .05 : 0);

                var height = logCount/Math.log(_max) * heightOfGraph;
                var previousHeight = logprevCount/Math.log(_max) * heightOfGraph;*/
                var height = count/_max * heightOfGraph;
                var previousHeight = prevCount/_max * heightOfGraph;
                if(height < 1 && height > 0) height =1;
                height = (_tween) * height + (1.0-_tween) * previousHeight;
                __p.rectMode(__p.CORNER);
                __p.rect(yearOffset * _widthPerYear,_size.h-paddingBottom, 2, - height );

            };
        __p.popMatrix();
    }
    function drawSelector()
    {
        __p.pushMatrix();
            __p.rectMode(__p.CORNERS);
            __p.translate(_position.x, _position.y);
            __p.stroke(parseInt(colors[3]))
            var width = (_selector[1] - _selector[0])/10;


        __p.stroke(0xCC4D586B);
        __p.fill(0xCC252A33);
            __p.rect(_selector[0],0, _selector[0] + width, _size.h);
            __p.stroke(255)
            __p.line(_selector[0],0, _selector[0] + width, 0);
            __p.line(_selector[0],_size.h, _selector[0] + width, _size.h);
            __p.textFont(__fontHeavy);
            __p.textSize(32);
        __p.fill(0xCC4D586B);
            __p.text(parseInt(BASEYEAR+_selector[0]/_widthPerYear),_selector[0],-5 );


            __p.noStroke();
            __p.fill(0xCC252A33);
            __p.rect(_selector[0]  + width,0, _selector[1] - width, _size.h);
            __p.stroke(parseInt(colors[2]))
            //__p.line(_selector[0]  + width,0, _selector[1] - width, 0);

            __p.stroke(0xCC4D586B);
        __p.fill(0xCC252A33);
            __p.rect(_selector[1]  - width,0, _selector[1], _size.h);
            __p.stroke(255)
            __p.line(_selector[1]  - width,0, _selector[1],0);
            __p.line(_selector[1]  - width,_size.h, _selector[1],_size.h);
            __p.fill(0xCC4D586B);
            __p.text(parseInt(BASEYEAR+_selector[1]/_widthPerYear),_selector[1]-80,-5 );

        __p.image(_imgArrowLeft,_selector[0]-10, _size.h/2 - _imgArrowLeft.height/2);
        __p.image(_imgArrowRight,_selector[1]+10, _size.h/2 - _imgArrowRight.height/2);


        __p.popMatrix();
    }
    //for use with touch, convert them with the scale and offset modifiers
    function selector(index)
    {
        return _selector[index]// * _handler.scale() + _handler.offset().x;
    }
    function setSelector(index, value)
    {
        _selector[index] = value;// = (value - _handler.offset().x)/_handler.scale();
    }
    function x(){
        return _position.x * _handler.scale() + _handler.offset().x;
    }
    function y(){
        return _position.y * _handler.scale() + _handler.offset().y;
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
            //console.log(JSON.stringify(_previousYears));
            if(_initialized == false || reset == true)
            {
                _selector = [0,_size.w];
                _initialized = true;
            }
            BASEYEAR = handler.getMax().minYear -  handler.getMax().minYear % 10;
            YEARS = (handler.getMax().maxYear - handler.getMax().maxYear %10) - BASEYEAR;
            _widthPerYear = _size.w / YEARS;
            _max =_handler.getMax().maxNewspapers;
            if(_max < 1) _max =1;
            //_selector = [0,YEARS*_widthPerYear];
            //console.log(YEARS)

            _guid = guid();
            _this = this;

            if(_imgArrowLeft == undefined)
                _imgArrowLeft = __p.loadImage("/ecloud/images/arrow_left.png");
            if(_imgArrowRight == undefined)
                _imgArrowRight = __p.loadImage("/ecloud/images/arrow_right.png");
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
                        //console.log(touch.x,_touchedMiddle.x);
                        _touchedMiddle.xChange = touch.x - _touchedMiddle.x;
                        _touchedMiddle.x = touch.x;

                        _touchedMiddle.alive = true;
                        //own the touch!
                        touch.owner = _guid;
                        touch.ownerObject = _this;
                       // //console.log("MIDDLE STILL EXISTS");

                        break;
                    case ids[0]:
                        _touchedLeft.xChange = touch.x - _touchedLeft.x;
                        _touchedLeft.x = touch.x;
                        _touchedLeft.alive = true;
                       // //console.log("LEFT STILL EXISTS");
                        //own the touch!
                        touch.owner = _guid;
                        touch.ownerObject = _this;

                        break;
                    case ids[1]:
                        _touchedRight.xChange = touch.x - _touchedRight.x;
                        _touchedRight.x = touch.x;
                        _touchedRight.alive = true;
                        //own the touch!
                        touch.owner = _guid;
                        touch.ownerObject = _this;
                        ////console.log("RIGHT STILL EXISTS " + _touchedRight.x);

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
                    var widthLeftArea = ((selector(1) - selector(0)) / 10);
                    var leftArea = [selector(0) + x(), selector(0) +widthLeftArea  + x()];
                    if (touch.x >= leftArea[0]  && touch.x <= leftArea[1]) {
                        _touchedLeft = JSON.parse(JSON.stringify(touch));
                        _touchedLeft.alive = true;
                        _touchedLeft.xChange = 0;
                        //console.log("LEFT");
                    }

                }
                if (_touchedRight == undefined) {
                    //find if there's a right touch
                    var widthRightArea = ((selector(1) - selector(0)) / 10);
                    var rightArea = [selector(1) - widthRightArea + x(), selector(1) + x() ];
                    if (touch.x >= rightArea[0] && touch.x <= rightArea[1]) {
                        _touchedRight = JSON.parse(JSON.stringify(touch));
                        _touchedRight.alive = true;
                        _touchedRight.xChange = 0;
                        //console.log("RIGHT");
                    }

                }
                if (_touchedMiddle == undefined) {
                    //find if there's a middle touch
                    var widthMiddleArea = ((selector(1) - selector(0)) / 10);
                    var rightArea = [selector(0) + widthMiddleArea + x(), selector(1) - widthMiddleArea + x()];
                    if (touch.x >= rightArea[0] && touch.x <= rightArea[1]) {
                        _touchedMiddle = JSON.parse(JSON.stringify(touch));
                        _touchedMiddle.alive = true;
                        _touchedMiddle.xChange = 0;
                        //console.log("MIDDLE");
                    }

                }


            });
            if (_touchedLeft != undefined && _touchedLeft.alive) {
                setSelector(0,selector(0) + _touchedLeft.xChange);

            }
            if (_touchedRight != undefined && _touchedRight.alive) {
                setSelector(1,selector(1) + _touchedRight.xChange);
            }
            if (_touchedMiddle != undefined &&_touchedMiddle.alive) {

                setSelector(0,selector(0) + _touchedMiddle.xChange);
               setSelector(1,selector(1) +_touchedMiddle.xChange);



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


            _wasAnythingAlive = false;
            if (_touchedLeft != undefined && !_touchedLeft.alive) {
                _touchedLeft = undefined;
                ////console.log("left gone");
                _wasAnythingAlive = true;
            }
            if (_touchedRight != undefined && !_touchedRight.alive) {
                _touchedRight = undefined;
                ////console.log("right gone");
                _wasAnythingAlive = true;
            }
            if (_touchedMiddle != undefined && !_touchedMiddle.alive) {
                _touchedMiddle = undefined;
                ////console.log("middle gone");
                _wasAnythingAlive = true;
            }

        },
        "untouch": function(touch) {
            //only update if none are touched, but one just was let go
            //console.log(parseInt(BASEYEAR+_selector[0]/_widthPerYear), parseInt(BASEYEAR+_selector[1]/_widthPerYear));
            _handler.callbackHandler([parseInt(BASEYEAR+_selector[0]/_widthPerYear),parseInt(BASEYEAR+_selector[1]/_widthPerYear)]);
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
            if(layerIndex == 0)
                drawSelector();
            drawWithColor(parseInt(colors[layerIndex]),layerIndex);

        }


    }
}
var TimelineHandler = function()
{
    var _minGlobalYear = 5000;
    var _maxGlobalYear = 0;
    var _maxPerYear = 0;
    var _timelines = [];
    var _imgTitle;
    var _layout;
    var _scale;
    var _offset = {x:0, y:0};
    socket.on("subQueryResult_Timeline", function(data){
        var years = data["YEAR"];
        _timeline.sub(years);
    });
    function updateLayer(years, layer,_this, reset)
    {

        if(layer == 0)
        {
            //if it's the bottom layer, it's the total data. find min max in years
            Object.keys(years).forEach(function(y){
               if(_minGlobalYear > y) _minGlobalYear = parseInt(y);
               if(_maxGlobalYear < y) _maxGlobalYear = parseInt(y);
                if(years[y] > _maxPerYear) _maxPerYear = parseInt(years[y]);
            });
            //console.log(_minGlobalYear, _maxGlobalYear, _maxPerYear);
        }
        if(_timelines[layer] == undefined)
            _timelines[layer] = new TimeLine();
        var w = $(window).width()* _layout.w / _scale;
        var h = $(window).height()* _layout.h / _scale;

        _timelines[layer].init(0,0, w ,h ,years, _this, reset);
    }

    return {
        "init":function(layout)
        {
            _layout = layout;

            _scale = 1;
            _offset.x = _layout.x * __screenWidth;
            _offset.y = _layout.y * __screenHeight;

            if(_imgTitle == undefined)
            {
                _imgTitle = __p.loadImage("/ecloud/images/title_years.png");
            }
        },
        "update": function(data)
        {
            var reset = false
            if(data.length == 1) //it's a reset, only one filter layer means show all, means reset has been hit
            {
                reset = true;
            }
            updateLayer(getWidgetSpecificData("year", data[0])["YEAR"],0,this, reset);
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
                updateLayer(getWidgetSpecificData("year", data[data.length-i])["YEAR"], i,this);
            }






        },
        "callbackHandler" : function(range)
        {
            //console.log("range is " + range)
            socket.emit("addFilter_Facet", {neeSession:__sessionID, facetType: "year", facetValue:range });

        },
        "activeLayer":function()
        {
            return _timelines;
        },
        "draw":function(){

            __p.pushMatrix();
            __p.translate(_offset.x, _offset.y)
            __p.scale(_scale);
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
            //__p.scale(.5)
            /*var h = $(window).height()*2;
            __p.image(_imgTitle, 10,h-120)*/
            __p.popMatrix();

        },
        "getMax": function(){
            return {maxYear: _maxGlobalYear, minYear:_minGlobalYear, maxNewspapers: _maxPerYear};
        },
        "name": "TimelineHandler",
        "scale": function(){return _scale;},
        "offset": function(){return _offset;},
        "boundingBox":function(){
            var w = $(window).width()* _layout.w;
            var h = $(window).height()* _layout.h;
            return {x1:_offset.x, x2:_offset.x + w, y1:_offset.y, y2: _offset.y + h};

        }



    }
}

var __timelineHandler = new TimelineHandler();

