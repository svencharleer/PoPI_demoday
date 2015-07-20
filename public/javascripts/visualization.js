/**
 * Created by svenc on 27/04/15.
 */
/* @pjs font='/stylesheets/Thin.otf,/stylesheets/Heavy.otf''; */

var __p;
var __canvas;
var __fontThin;
var __fontHeavy;


var visualization = function () {

    var handleTouches = function(processing)
    {
        _modules.forEach(function(m){
            var touchesForModule = {};
            var bb = m.boundingBox();
            Object.keys(_touches).forEach(function(t){
               var touch = _touches[t];
               if(touch.x > bb.x1
                   && touch.x < bb.x2
                   && touch.y > bb.y1
                   && touch.y < bb.y2)
               {
                    touchesForModule[t] = touch;
               }
            });
            try {
                m.activeLayer().forEach(function(c){
                    c.touch(touchesForModule);

                })
            }
            catch(exc)
            {
                //console.log("touch update loop exc: " + exc);
            }
        });

    }


    var drawModules = function()
    {
        _modules.forEach(function(m){m.draw()})


    }

    var drawExtras = function()
    {
        _extras.forEach(function(m){m.draw()})


    }


    var setup = function () {
        var processing = Processing.getInstanceById(__canvas);
        processing.size($("#" + __canvas).width(), $("#" + __canvas).height(), processing.JAVA2D);
        processing.frameRate(30);


    };


    var draw = function () {

        var processing = Processing.getInstanceById(__canvas);
        processing.background(0,0);
        //processing.smooth();

        handleTouches(processing);
        drawModules();
        drawExtras();

        //debug draw cursors
        Object.keys(_debugCursors).forEach(function(c)
        {
            if(_debugCursors[c] != undefined)
            {
                processing.fill(0,255,0);
                processing.ellipse(_debugCursors[c].x, _debugCursors[c].y, 10, 10);
            }
        });



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
    var _modules = [];
    var _extras = [];
    return {
        "init": function (canvas, modules, extras) {
            __canvas = canvas;
            _modules = modules;
            if(extras != undefined)
                _extras = extras;
            initProcessing();
            __p = Processing.getInstanceById(__canvas);
            if(__fontHeavy == undefined)
                __fontHeavy = __p.createFont('Heavy', 32);

            if(__fontThin == undefined)
                __fontThin = __p.createFont('Thin', 32);


        },

        "addTouch": function (id, x, y) {

            if(_pOffset == undefined) {
                _pOffset ={x: _offset.x, y:_offset.y};
                _pOffset.startX = x ;
                _pOffset.id = id;

            }
            _debugCursors[id] = {id:id,x:x,y:y};
            _touches[id] = {id:id,x:x,y:y, startx:x, starty:y};
           // //console.log("adding touch");



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

            //console.log("remove touch")
            //console.log(_touches[id])
            if(_touches[id] != undefined && _touches[id].owner != undefined)
            {

                //warn the owner that the touch stopped
                if(_touches[id].ownerObject.untouch != undefined)
                    _touches[id].ownerObject.untouch(_touches[id]);
            }
            _touches[id] = undefined;
            delete _touches[id];
            _debugCursors[id] = undefined;
            delete _debugCursors[id];
            if(_pOffset != undefined && id == _pOffset.id) {

                _pOffset = undefined
            }


        },
        "scroll": function(delta, x,y){
            _modules.forEach(function(m){
                var touchesForModule = {};
                var bb = m.boundingBox();

                if(x > bb.x1
                    && x< bb.x2
                    && y > bb.y1
                    && y < bb.y2)
                {
                    m.activeLayer().forEach(function(c){
                        if(c.type != undefined && c.type() == "scrollbar")
                            c.scroll(delta);

                    })
                }


            });
        }


    };

}




