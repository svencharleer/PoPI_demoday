/**
 * Created by svenc on 27/04/15.
 */

var __p;

var __canvas;

var tween = function (x,y, dx, dy, t) {


    return {x: dx*(t*t*t ) + x*(1- t*t*t ),
        y: dy*(t*t*t ) + y*(1- t*t*t )};
    n

};


var visualization = function () {




var _tweens = {};



//METHODS





    var handleTouches = function(processing)
    {
        try {





                __countryHandler.activeLayer().forEach(function(c){
                    c.touch(_touches);

                })
            __newspaperHandler.activeLayer().forEach(function(c){
                c.touch(_touches);

            })






        }
        catch(exc)
        {
            console.log("touch update loop exc: " + exc);
        }
    }



    var convert01RangeToScreenCorners = function(x,y,_processing)
    {
        var screenWidth = $("#" + __canvas).width();
        var screenHeight = $("#" + __canvas).height();
        var v = new _processing.PVector(x -.5,y -.5);
        v.normalize();
        var signX = v.x? v.x<0?-1:1:0;
        var signY = v.y? v.y<0?-1:1:0;



        x = v.x * screenWidth / 2;
        y = v.y * screenHeight /2;
        if(Math.abs(v.x)>Math.abs(v.y)) x = signX * screenWidth / 2;;
        if(Math.abs(v.x)<Math.abs(v.y)) y = signY * screenHeight / 2;
        if(Math.abs(v.x)==Math.abs(v.y)) {x = signX * screenWidth / 2; y = signY * screenHeight / 2;};
        x += screenWidth/2;
        y += screenHeight/2;
        x = x- v.x * 60;
        y = y- v.y * 60;
        return {x:x, y: y, v:v};
    }








    var drawCountryResults = function()
    {
        __countryHandler.draw();


            __timelineHandler.draw();
        __newspaperHandler.draw();
        __consoleHandler.console().draw();

    }








    var setup = function () {
        var processing = Processing.getInstanceById(__canvas);
        processing.size($("#" + __canvas).width(), $("#" + __canvas).height(), processing.JAVA2D);
        processing.frameRate(30);


    };



    var draw = function () {

        var processing = Processing.getInstanceById(__canvas);
        processing.background(0,0);

        handleTouches(processing);

        //drawRealTable(processing);
        drawCountryResults();
        //drawCountries(processing);

        //drawTimeLine(processing);

        //debug draw cursors
        Object.keys(_debugCursors).forEach(function(c)
        {
            if(_debugCursors[c] != undefined)
            {
                processing.fill(0,255,0);
                processing.ellipse(_debugCursors[c].x, _debugCursors[c].y, 10, 10);
            }
        });

        //_dataPoints= {};

        processing.smooth();
    };


    var initProcessing = function () {

        var sketch = new Processing.Sketch();

        sketch.attachFunction = function (processing) {
            processing.setup = setup;
            processing.draw = draw;

        };

        var canvas = document.getElementById(__canvas);
        // attaching the sketch to the canvas
        var p = new Processing(canvas, sketch);
    }







    var _touches = {};
    var _offset = {x: 0, y: 0};
    var _pOffset = undefined;
    var _debugCursors = [];

    return {
        "init": function (canvas) {
            __canvas = canvas;

            initProcessing();
            __p = Processing.getInstanceById(__canvas);



        },

        "addTouch": function (id, x, y) {

            if(_pOffset == undefined) {
                _pOffset ={x: _offset.x, y:_offset.y};
                _pOffset.startX = x ;
                _pOffset.id = id;

            }
            _debugCursors[id] = {id:id,x:x,y:y};
            _touches[id] = {id:id,x:x,y:y, startx:x, starty:y};
           // console.log("adding touch");



        },
        "updateTouch": function(id, x, y) {



            if(_touches[id] == undefined) return;
            _touches[id].x = x;
            _touches[id].y = y;
            _debugCursors[id] = {id:id,x:x,y:y};
            if(_pOffset != undefined)
                _offset.x = (_touches[id].x - _pOffset.startX) + _pOffset.x;


        },
        "removeTouch" :function (id, x, y) {


            _touches[id] = undefined;
            delete _touches[id];
            _debugCursors[id] = undefined;
            delete _debugCursors[id];
            if(_pOffset != undefined && id == _pOffset.id) {

                _pOffset = undefined
            }


        }


    };

}




