/**
 * Created by svenc on 27/04/15.
 */
var visualization = function () {

var __canvas;
var _users;
var _solos;
var _countries;

//METHODS

var _dataPoints = {};

    var handleTouches = function(processing)
    {
        try {
            var sphereWidth = 22;
            var sphereHeight = 13;


            Object.keys(_users).forEach(function (k) {
                _users[k].touched = false;
                Object.keys(_users[k].screenCoords).forEach(function (s) {

                    //if within distance of center:
                    var x = _users[k].screenCoords[s].x - sphereWidth / 2;
                    var y = _users[k].screenCoords[s].y - sphereHeight / 2;
                    Object.keys(_touches).forEach(function (t) {
                        var touch = _touches[t];
                        if (processing.dist(x, y, touch.x, touch.y) < 22) {
                            _dataPoints[s] = {x:x,y:y};

                        }
                        return false;
                    });


                });

            })
        }
        catch(exc)
        {
            console.log("touch update loop exc: " + exc);
        }
    }

    var drawCountries = function(processing)
    {
        _countries.forEach(function(country){
            processing.fill(255);
            processing.text(country.name, country.x, country.y-10, 1000,100);
        });
    }
    var drawSolos = function(_processing)
    {
        try {
            var screenWidth = $("#" + __canvas).width();
            var screenHeight = $("#" + __canvas).height();
            Object.keys(_solos).forEach(function (k) {
                var solo = _solos[k];
                var x= solo.x,y=solo.y;
                if(solo.x < .5 && solo.y < .5)
                {
                    if(solo.x < solo.y) x = 0;
                    else y = 0;
                }
                else if(solo.x < .5 && solo.y >= .5)
                {
                    if(solo.x < (1.0 - solo.y)) x = 0;
                    else y = 1;
                }
                else if(solo.x >= .5 && solo.y < .5)
                {
                    if((1.0 - solo.x) <  solo.y) x = 1;
                    else y = 0;
                }
                else if(solo.x >= .5 && solo.y >= .5)
                {
                    if(solo.x >  solo.y) x = 1;
                    else y = 1;
                }
                _processing.strokeWeight(5);
                _processing.noFill();
                _processing.stroke(parseInt(solo.color));
                _processing.ellipse(x * screenWidth, y * screenHeight, 100, 100);
            });
        }
        catch(exc)
        {
            console.log(exc);
        }


    }

    var drawSelected = function(processing)
    {
        Object.keys(_dataPoints).forEach(function(d){
            processing.fill(0);
            processing.stroke(255);
            processing.strokeWeight(2);

            processing.ellipse(_dataPoints[d].x,_dataPoints[d].y, 100,100);
        });

    }
    var drawRealTable = function(_processing)
    {
        var screenWidth =  $("#" + __canvas).width();
        var screenHeight = $("#" + __canvas).height()





        Object.keys(_users).forEach(function (k) {

            Object.keys(_users[k].screenCoords).forEach(function(s){

                var sphereWidth = 22;
                var sphereHeight = 13;
                var padding = -4;
                var size = 6;
                var x = _users[k].screenCoords[s].x - sphereWidth/2;
                var y = _users[k].screenCoords[s].y - sphereHeight/2;



                //was it touched?
                var touched = false;
                if(_dataPoints[s] != undefined)
                    touched = true;

                //first the data point
                {
                    _processing.noFill();
                    _processing.stroke(255);
                    //_processing.ellipse(x,y,2*sphereWidth,2*sphereHeight)

                    _processing.rectMode(_processing.CORNERS);


                    _processing.strokeWeight(1);
                    _processing.noFill(255);
                    _processing.rect(x - sphereWidth/2 - padding, y - sphereHeight/2 - padding, x + sphereWidth/2 + padding, y + sphereHeight/2 + padding);
                }


                //then draw the user dot
                var userX = _users[k].position.x * screenWidth;
                var userY = _users[k].position.y * screenHeight;
               _processing.noStroke();
                _processing.strokeWeight(1);
                _processing.fill(parseInt(_users[k].color));

                var xDiff = (userX/ screenWidth );
                var yDiff = (userY / screenHeight );
                var v = new _processing.PVector(xDiff, yDiff);
                //v.normalize();

                if(touched)
                {
                    sphereWidth *=2;
                    sphereHeight *= 2;
                    size*=2;
                }
                xDiff = v.x *  sphereWidth;
                yDiff = v.y * sphereHeight;



                _processing.ellipse(x- sphereWidth/2+xDiff,y- sphereHeight/2+yDiff, size,size)
                if(touched)
                {

                    _processing.pushMatrix();

                    var one = new _processing.PVector(1,0);
                    //var onetwo = new _processing.PVector(userX-screenWidth/2,-(userY-screenHeight/2));
                    var onetwo = new _processing.PVector((userX-screenWidth/2)/screenWidth,-(userY-screenHeight/2)/screenHeight);
                    var angle = _processing.PVector.angleBetween(onetwo, one);
                    //if((onetwo.y < 0 && onetwo.x <0) || (onetwo.y > 0 && onetwo.x >0))

                    if(onetwo.y < 0 || onetwo.x < 0)
                        angle += _processing.PI/2;
                    if(onetwo.y > 0 && onetwo.x < 0)
                        angle -= 3*_processing.PI/2;
                    if(onetwo.y > 0 && onetwo.x > 0)
                        angle = _processing.PI/2 - angle;
                    _processing.translate(x,y);

                    _processing.rotate(angle+_processing.PI);

                   _processing.translate(-15,55);

                    _processing.textAlign(_processing.CENTER);


                    _processing.text(_users[k].data[s],0,0,30,20);
                    _processing.popMatrix();
                    _processing.textAlign(_processing.LEFT);
                }

            });

        })
    };


    var setup = function () {
        var processing = Processing.getInstanceById(__canvas);
        processing.size($("#" + __canvas).width(), $("#" + __canvas).height(), processing.JAVA2D);


    };



    var draw = function () {

        var processing = Processing.getInstanceById(__canvas);
        processing.background(0,0);

        handleTouches(processing);

        drawSelected(processing);
        drawRealTable(processing);
        drawSolos(processing);
        drawCountries(processing);

        //debug draw cursors
        Object.keys(_debugCursors).forEach(function(c)
        {
            if(_debugCursors[c] != undefined)
            {
                processing.fill(0,255,0);
                processing.ellipse(_debugCursors[c].x, _debugCursors[c].y, 10, 10);
            }
        });

        _dataPoints= {};

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






    var _p = {};
    var _touches = {};
    var _offset = {x: 0, y: 0};
    var _pOffset = undefined;
    var _debugCursors = [];

    return {
        "init": function (canvas) {
            __canvas = canvas;

            initProcessing();
            var processing = Processing.getInstanceById(__canvas);

            _p = processing;
            _users = {};
            _solos = {};
            _countries = [];

        },
        "update": function( users, solos, countries)
        {
            _users = users;
            _solos = solos;
            _countries = countries;
        },
        "addTouch": function (id, x, y) {

            if(_pOffset == undefined) {
                _pOffset ={x: _offset.x, y:_offset.y};
                _pOffset.startX = x ;
                _pOffset.id = id;

            }
            _debugCursors[id] = {id:id,x:x,y:y};
            _touches[id] = {id:id,x:x,y:y, startx:x, starty:y};
            console.log("adding touch");



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




