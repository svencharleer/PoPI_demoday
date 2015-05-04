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
    var drawSolos = function(_processing)
    {
        try {
            var screenWidth = $("#" + __canvas).width();
            var screenHeight = $("#" + __canvas).height();
            Object.keys(_solos).forEach(function (k) {
                var solo = _solos[k];
                var x= solo.x,y=solo.y;

                var converted =convert01RangeToScreenCorners(x,y,_processing);
                x= converted.x;
                y = converted.y;

                _processing.strokeWeight(5);
                _processing.noFill();
                _processing.stroke(parseInt(solo.color));
                _processing.ellipse(x, y, 100, 100);

                //draw welcome!
                _processing.textAlign(_processing.CENTER);


                _processing.pushMatrix();
                _processing.translate(x,y);
                if(x == -converted.v.x * 60) _processing.rotate(Math.PI/2);
                else if(x == screenWidth-converted.v.x * 60) _processing.rotate(-Math.PI/2);
                else if(y == -converted.v.y * 60) _processing.rotate(Math.PI);
                _processing.translate(-25,0);
                _processing.fill(parseInt(solo.color));
                _processing.text("welcome",0,0,50,20);
                _processing.popMatrix();

                _processing.textAlign(_processing.LEFT);
            });
        }
        catch(exc)
        {
            console.log(exc);
        }


    }

    var oldTween = function(x,y, dx, dy, t)
    {
        return {x: t*dx + (1.0-t)*x
                ,y: t*dy + (1.0-t)*y}
    }

    var tween = function (x,y, dx, dy, t) {


        return {x: dx*(t*t*t ) + x*(1- t*t*t ),
            y: dy*(t*t*t ) + y*(1- t*t*t )};
n

    };

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



        var origin = {};

        Object.keys(_users).forEach(function (k) {
            //draw generic thing

            var converted = convert01RangeToScreenCorners(_users[k].position.x,_users[k].position.y,_processing);
            origin = {x:converted.x, y: converted.y};
            _processing.fill(parseInt(_users[k].color));
            _processing.noStroke();
            _processing.ellipse(converted.x, converted.y,10,10);
            _processing.ellipse(converted.x-10, converted.y-10,10,10);
            _processing.ellipse(converted.x+10, converted.y+10,10,10);
            _processing.ellipse(converted.x-10, converted.y+10,10,10);
            _processing.ellipse(converted.x+10, converted.y-10,10,10);


            //stuff animates when an update happens
            if(_users[k].dataUpdate)
            {
                _users[k].tween = 0;
                _users[k].dataUpdate = false;

            }


            // draw the data points
            if(_users[k].screenCoords != undefined) {
                Object.keys(_users[k].screenCoords).forEach(function (s) {

                    var sphereWidth = 22;
                    var sphereHeight = 20;
                    var padding = -5;
                    var size = 6;
                    var x = _users[k].screenCoords[s].x;
                    var y = _users[k].screenCoords[s].y;


                    //was it touched?
                    var touched = false;
                    if (_dataPoints[s] != undefined)
                        touched = true;

                    //first the data point
                    {
                        _processing.noFill();
                        _processing.stroke(255);
                        //_processing.ellipse(x,y,2*sphereWidth,2*sphereHeight)

                        _processing.rectMode(_processing.CORNERS);


                        _processing.strokeWeight(1);
                        _processing.noFill(255);

                        _processing.rect(x - sphereWidth / 2 - padding, y - sphereHeight / 2 - padding, x + sphereWidth / 2 + padding, y + sphereHeight / 2 + padding);
                    }


                    //then draw the user dot
                    var userX = _users[k].position.x * screenWidth;
                    var userY = _users[k].position.y * screenHeight;
                    _processing.noStroke();
                    _processing.strokeWeight(1);
                    _processing.fill(parseInt(_users[k].color));

                    var xDiff = ((userX - screenWidth / 2 ) / screenWidth );
                    var yDiff = ((userY - screenHeight / 2) / screenHeight );
                    var v = new _processing.PVector(xDiff, yDiff);
                    v.normalize();

                    if (touched) {
                        sphereWidth *= 2;
                        sphereHeight *= 2;
                        size *= 2;
                    }
                    xDiff = v.x * sphereWidth / 2;
                    yDiff = v.y * sphereHeight / 2;


                    var dest = tween(origin.x, origin.y, x + xDiff, y + yDiff, _users[k].tween);
                    _processing.ellipse(dest.x, dest.y, size, size)
                    if (touched) {

                        _processing.pushMatrix();

                        var one = new _processing.PVector(1, 0);
                        //var onetwo = new _processing.PVector(userX-screenWidth/2,-(userY-screenHeight/2));
                        var onetwo = new _processing.PVector((userX - screenWidth / 2) / screenWidth, -(userY - screenHeight / 2) / screenHeight);
                        var angle = _processing.PVector.angleBetween(onetwo, one);
                        //if((onetwo.y < 0 && onetwo.x <0) || (onetwo.y > 0 && onetwo.x >0))

                        if (onetwo.y < 0 || onetwo.x < 0)
                            angle += _processing.PI / 2;
                        if (onetwo.y > 0 && onetwo.x < 0)
                            angle -= 3 * _processing.PI / 2;
                        if (onetwo.y > 0 && onetwo.x > 0)
                            angle = _processing.PI / 2 - angle;
                        _processing.translate(x, y);

                        _processing.rotate(angle + _processing.PI);

                        _processing.translate(-15, 55);

                        _processing.textAlign(_processing.CENTER);


                        _processing.text(_users[k].data[s], 0, 0, 30, 20);
                        _processing.popMatrix();
                        _processing.textAlign(_processing.LEFT);
                    }

                });
            }
            if(_users[k].tween < 1)
            {
                //update anim
                _users[k].tween += 1/(30*2);
                console.log(_processing.frameRate);
                console.log(_users[k].tween);
            }
            else
            {
                _users[k].tween = 1;
            }
        })


    };


    var setup = function () {
        var processing = Processing.getInstanceById(__canvas);
        processing.size($("#" + __canvas).width(), $("#" + __canvas).height(), processing.JAVA2D);
        processing.frameRate(30);


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




