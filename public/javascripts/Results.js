/**
 * Created by svenc on 17/06/15.
 */

//var colors = ["0xCCFF3E3E","0xCC7C4EE8","0xCC33F0FF","0xCC91E870","0xCCFFE085"];

var __newspaperSVG = undefined;
var __newspaperHSVG = undefined;

var ResultPaper = function()
{




    function drawWithColor(color)
    {
        var x = _position.x;
        var y = _position.y;
        var count = _tween * _results.count + (1.0-_tween) * _results.prevCount;

        var length = Math.log(count)*10;


        __p.fill(color);

        __p.noStroke();
        __p.rectMode(__p.CORNERS);
        __p.rect(x,y,x+length, y +10);

        __p.fill(0xCC4F4F51);
        __p.text(_name, x-10,y-5,200,20);

        __p.fill(color);
        __p.noStroke();
        __p.text(count, x-50,y-5);

    }


    return {
        "init" : function(name, position, results, handler)
        {
            _name = name;

            _position = position;
            _results = results;
            _handler = handler;
        },
        "title" : function()
        {
            return _name;
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
                        _handler.callbackHandler(_name);
                        return true;



                }
            })
            if(!touchStillExists) _touched = undefined;

        },

        "draw" : function(layerIndex, nrOfLayers)
        {
            drawWithColor(parseInt(colors[layerIndex]));
        },
        "drawDim": function(layerIndex, nrOfLayers)
        {
            var color = tinycolor(colors[layerIndex].replace("0xCC","#")).toHsv();
             color.v = color.v * .3;
             var rgb = tinycolor(color).toRgb();
             drawWithColor(__p.color(rgb.r, rgb.g, rgb.b));

        },
        "count" : function(){return _results.count;}



    }
}

var resultDummy = function()
{

    var _content = {TITLE:"",ID:"",URI:""};//TITLE[0], URI, ID
    var _position = {x:0, y:0};
    var _position2 = {x:0,y:0};



    var _touched = undefined;
    var _handler;
    var _size = {w:1,h:1};
    var _prevSize = {w:1,h:1};
    var _guid;
    var _this;
    var _tween = 0;
    return {
        "init": function(x,y,handler)
        {
            _tween = 0;
            _position.x = x;
            _position.y = y;
            _content = undefined;
            _prevSize.w = _size.w;
            _prevSize.h = _size.h;
            _size = {w:1,h:1};
            _handler = handler;
            _guid = guid();
            _this = this;
        },
        "initWithContent": function(x,y,width, height,content,handler)
        {
            _tween = 0;
            _position2.x = x;
            _position2.y = y;
            _prevSize.w = _size.w;
            _prevSize.h = _size.h;
            _size.w = width;
            _size.h = height;
            _content = content;
            _handler = handler;
            _guid = guid();
            _this = this;
            if(__newspaperSVG == undefined) {
                __newspaperSVG = __p.loadShape("/images/newspaper.svg");
            }
            if(__newspaperHSVG == undefined){
                __newspaperHSVG = __p.loadShape("/images/newspaper_highlight.svg");
            }
        },

        "draw": function(selected)
        {
            if(_content== undefined) {
                __p.stroke(255);
                __p.noFill();
                __p.point(_position.x, _position.y);
            }
            else
            {
                __p.rectMode(__p.CORNER);
                __p.stroke(255);
                var svg = __newspaperSVG;
                if(selected)
                    svg = __newspaperHSVG;

                __p.shape(svg, _position2.x * _tween + _position.x * (1.0 -_tween),
                            _position2.y * _tween + _position.y * (1.0 -_tween),
                            _size.w * _tween + _prevSize.w * (1.0 - _tween),
                            _size.h * _tween + _prevSize.h * (1.0 - _tween));
                __p.fill(0)
                __p.textFont(__fontThin);
                __p.textSize(_size.h/8);
                __p.text(_content.TITLE, _position2.x * _tween + _position.x * (1.0 -_tween)+2,
                        _position2.y * _tween + _position.y * (1.0 -_tween)+2,
                        _size.w * _tween + _prevSize.w * (1.0 - _tween)-2,
                        _size.h/2 * _tween +  _prevSize.h/2 * (1.0 - _tween)-2)
                __p.textSize(_size.h/3);
                __p.textFont(__fontHeavy);
                __p.text(new Date(_content.DATE).getFullYear(), _position2.x * _tween + _position.x * (1.0 -_tween)+2,
                        _position2.y * _tween + _position.y * (1.0 -_tween)+2 +_size.h/2,
                        _size.w * _tween + _prevSize.w * (1.0 - _tween)-2,
                        _size.h/2 * _tween + _prevSize.h/2 * (1.0 - _tween)-2)
            }

        },
        "animate" : function()
        {
            if(_tween < 1.0)
            {
                _tween += .05;
            }
            if(_content== undefined) {
                _position.x += Math.random() * 2 - 1;
                _position.y += Math.random() * 2 - 1;
            }
            else
            {
                _
            }

        },
        "touch" : function(touches)
        {
            if(_content == undefined) return; //fake dots floating around
            var touchStillExists = false;
            Object.keys(touches).forEach(function(t){
                var touch = touches[t];
                if(_touched != undefined && _touched.id == touch.id) {
                    touchStillExists = true;
                    return true;
                }
                if (_touched == undefined &&
                    touch.x > _position2.x &&
                    touch.x < _position2.x +  _size.w &&
                    touch.y > _position2.y &&
                    touch.y < _position2.y +  _size.h) {


                    touchStillExists = true;
                    _touched = touch;
                    //own the touch!
                    touch.owner = _guid;
                    touch.ownerObject = _this;
                   // _handler.callbackHandler(_content.ID, _content.URI);
                    return true;



                }
            })
            if(!touchStillExists) _touched = undefined;

        },
        "untouch": function(touch)
        {

            if (_touched != undefined && _touched.id == touch.id &&
                touch.x > _position2.x &&
                touch.x < _position2.x +  _size.w &&
                touch.y > _position2.y &&
                touch.y < _position2.y +  _size.h)
            {
                _handler.callbackHandler(_content.ID, _content.URI);

            }
            _touched = undefined;
        },
        "ID": function()
        {
            if(_content != undefined)
                return _content.ID;
            return -1;
        },
        "title": function()
        {
            if(_content != undefined)
                return _content.TITLE[0];
            return "dot";
        },
        "URI": function()
        {
            if(_content != undefined)
                return _content.URI;
            return "http://google.com";
        }

    }
}
var ResultsHandler = function()
{
    var _nrOfResults = 0;
    var _nrOfPreviousResults = 0;
    var _results = [];
    var _selectedResults = [];
    var _this;

    socket.on("resultUpdate", function(msg)
    {

        console.log(msg);

        var screenWidth = $("#" + __canvas).width();
        var screenHeight = $("#" + __canvas).height()
        var max = _nrOfResults;
        var previousMax = _nrOfPreviousResults > 10000 ? 10000 : _nrOfPreviousResults;
        if (previousMax < 50 && previousMax > max) {
            for (var i = 0; i < previousMax - max; i++)
                _results.pop();
        }

        var surface = screenHeight * screenWidth;
        var surfacePerPaper = surface/_nrOfResults;
        var scale = Math.sqrt(surfacePerPaper/(4*3)); //4:3 ratio of paper
        var widthOfPaper = 3 * scale;
        var heightOfPaper = 4 * scale;
        var nrOfPapersPerWidth = parseInt(screenWidth/widthOfPaper)+1;

        _results = [];
        msg.some(function(d,i){
            var r = new resultDummy();
            r.initWithContent(((i) % nrOfPapersPerWidth) * widthOfPaper, parseInt((i) / nrOfPapersPerWidth) * heightOfPaper, widthOfPaper-10, heightOfPaper-10,
                d,_this);
            _results.push(r);
        });




    })

    return {
        "update": function(data)
        {
            _this = this;
            //if lower than 100 results, we can start showing details and load correct article
            //give ID to each result, so we know when they vanish
            //but cna't do that above 100 results
            //so 2 vis. 1 mess, 1 x 100 perfect results
            _nrOfPreviousResults = _nrOfResults;
            var data = getWidgetSpecificData("", data[data.length - 1]);

            var total = 0; //get the total
            Object.keys(data["LANGUAGE"]).some(function(l){
                total += data["LANGUAGE"][l];
            })
            _nrOfResults = total;
            var screenWidth = $("#" + __canvas).width();
            var screenHeight = $("#" + __canvas).height()
            var max = _nrOfResults > 10000 ? 10000 : _nrOfResults;
            var previousMax = _nrOfPreviousResults > 10000 ? 10000 : _nrOfPreviousResults;
            if(_nrOfResults < 50 && _nrOfResults >0)
            {
                //call server for actual results
                socket.emit("getResults",{});
                return;

            }
            else {









                if (previousMax < 50) { //we had results before, but below 100, so reinit those as dots
                    for (var i = 0; i < previousMax; i++) {
                        _results[i].init(Math.random() * screenWidth, Math.random() * screenHeight);
                    }
                }
                if (previousMax > max) {
                    for (var i = 0; i < previousMax - max; i++)
                        _results.pop();
                }
                else {
                    for (var i = 0; i < max - previousMax; i++) {
                        var r = new resultDummy();
                        r.init(Math.random() * screenWidth, Math.random() * screenHeight)
                        _results.push(r);
                    }
                }
            }



        },
        "callbackHandler" : function(ID,URI)
        {
            //already selected?
            if(_selectedResults.indexOf(ID) >= 0)
            {
                socket.emit("hideResult", ID);
                _selectedResults.splice(_selectedResults.indexOf(ID),1);
            }
            else
            {
                _selectedResults = [];
                socket.emit("showResult", ID);
                _selectedResults.push(ID);
            }
        },
        "activeLayer":function()
        {

           return _results;

        },
        "draw":function() {
            _results.forEach(function(r){
                r.animate();
                var selected = false;
                if(_selectedResults.indexOf(r.ID())>=0)
                    selected = true;
                r.draw(selected);
            })
            __p.fill(parseInt(colors[1]));
            __p.textFont(__fontHeavy);
            __p.textSize(40);
            //var screenWidth =  $("#" + __canvas).width();
            var screenHeight = $("#" + __canvas).height();

            __p.text(_nrOfResults,10,screenHeight-20);



        }


    }
}

var __resultsHandler = new ResultsHandler()

