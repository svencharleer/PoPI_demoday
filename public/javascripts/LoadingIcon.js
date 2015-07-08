/**
 * Created by svenc on 23/06/15.
 */

var DCIcon = function()
{
    var _tween = 0;
    var _tweenUpdate = .02;




    return {
        "init": function()
        {

        },
        "draw":function(x,y)
        {
            __p.fill(0xCCFF6C5C,100);
            __p.rect(0,0,__screenWidth,__screenHeight)
            __p.pushMatrix();
            __p.translate(__screenWidth/4,__screenHeight/4);
            __p.fill(0xCCFF6C5C,_tween  * 255);
            __p.textFont(__fontHeavy);
            __p.textSize(100);
            __p.textAlign(__p.CENTER,__p.CENTER)
            __p.text("DISCONNECTED",0,0);
            __p.popMatrix();




        },
        "animate":function()
        {
            if(_tween > 1.0 || _tween < 0.0)
            {
                _tweenUpdate = -_tweenUpdate;
            }

            _tween +=_tweenUpdate;
        }

    }
}

var LoadingIcon = function()
{
    var _tween = 0;
    var _tweenUpdate = .02;




    return {
        "init": function()
        {

        },
        "draw":function(x,y)
        {

            __p.pushMatrix();
                 __p.rectMode(__p.CORNER);
                __p.translate(x,y);
                __p.noStroke();
                __p.fill(0);
                __p.rect(-15,-30,200,48,10);
                __p.translate(0,3);
                __p.stroke(255);
                __p.noFill();
                __p.ellipse(0,0,20,20);
                __p.pushMatrix();

                    __p.fill(255);
                    __p.noStroke();
                    __p.rotate(_tween* _tween * 2* Math.PI);
                    __p.translate(-7.5,-3);
                    __p.rect(0, 0, 15, 6);
                __p.popMatrix();
                __p.pushMatrix();
                    __p.rotate(_tween* _tween * 2* Math.PI + Math.PI/2);
                    __p.translate(-7.5,-3);
                    __p.rect(0, 0, 15, 6);
                __p.popMatrix();
                __p.translate(15,6);
                __p.fill(255 * _tween);
                __p.textFont(__fontHeavy);
                __p.textSize(15);
                __p.text("loading",0,0);
            __p.popMatrix();




        },
        "animate":function()
        {
            if(_tween > 1.0 || _tween < 0.0)
            {
                _tweenUpdate = -_tweenUpdate;
            }

            _tween +=_tweenUpdate;
        }

    }
}


var LoadingHandler = function()
{
    var _loadingIcon = new LoadingIcon();

    var _show = false;
    var _tween = 0;
    var _position = {x:0, y:0};
    return{
        "init":function(x,y)
        {
            _loadingIcon.init();
            _position.x =x;
            _position.y = y;
        },
        "show":function()
        {
            _tween = 0;
            _show = true;
        },
        "hide":function()
        {
            _show = false;
            _tween = 0;
        },
        "dc":function()
        {
            _show = true;
            _loadingIcon = new DCIcon();
        },
        "draw":function()
        {

           if(_tween < 1.0)
           {
               _tween +=.05;
           }
            _loadingIcon.animate();
           if(_show)
           {
               var y = _tween *_position.y + (1.0 - _tween) * (_position.y-100);
                _loadingIcon.draw(_position.x, y);
               //console.log("show");
           }
           else
           {
               var y = (1.0 - _tween) *_position.y + _tween * (_position.y-100);
               _loadingIcon.draw(_position.x, y);
               //console.log("hide");
           }
        }
    }
}
__loadingHandler = new LoadingHandler();
