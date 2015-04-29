/**
 * Created by svenc on 27/04/15.
 */
var visualization = function () {

var __canvas;
var _users;
var _solos;

//METHODS

var _dataPoints = {};

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
    var drawRealTable = function(_processing)
    {
        var screenWidth =  $("#" + __canvas).width();
        var screenHeight = $("#" + __canvas).height()
        var sphereWidth = 40;
        var sphereHeight = 20;


        Object.keys(_users).forEach(function (k) {
            Object.keys(_users[k].screenCoords).forEach(function(s){
                var x = _users[k].screenCoords[s].x - sphereWidth/2;
                var y = _users[k].screenCoords[s].y - sphereHeight/2;

                //first the data point
                if(_dataPoints[s] == undefined) {
                    _processing.noFill();
                    _processing.stroke(128);
                    //_processing.ellipse(x,y,2*sphereWidth,2*sphereHeight)

                    _processing.rectMode(_processing.CORNER);
                    _processing.noStroke();


                    _processing.strokeWeight(1);
                    _processing.fill(255);
                    _processing.rect(x + sphereWidth / 4, y + sphereHeight / 3, sphereWidth / 2, 4);

                }

                //then draw the user dot
                var userX = _users[k].position.x * screenWidth;
                var userY = _users[k].position.y * screenHeight;
                _processing.fill(parseInt(_users[k].color));

                var xDiff = (userX/ screenWidth );
                var yDiff = (userY / screenHeight );
                var v = new _processing.PVector(xDiff, yDiff);
                //v.normalize();
                xDiff = v.x *  sphereWidth;
                yDiff = v.y * sphereHeight;

                // _processing.line(x,y,x+xDiff,y+yDiff);

                _processing.ellipse(x+xDiff,y+yDiff, 4,4)

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
        drawRealTable(processing);
        drawSolos(processing);
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
    return {
        "init": function (canvas) {
            __canvas = canvas;

            initProcessing();
            var processing = Processing.getInstanceById(__canvas);

            _p = processing;
            _users = {};
            _solos = {};

        },
        "update": function( users, solos)
        {
            _users = users;
            _solos = solos;
        }


    };

}




