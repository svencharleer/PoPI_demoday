/**
 * Created by svenc on 30/06/15.
 */
var __vis;

var __screenWidth;
var __screenHeight;

var __resolutionModifier = 2;

var loadAll = function(modules) {

    var _width = $(window).width();
    var _height = $(window).height();
    //if(_width < 1280) _width = 1280;
    //if(_height < 1024) _height = 1024;
    $("#overlay").attr("width",_width*2);
    $("#overlay").attr("height",_height*2);




    __loadingHandler.init(_width - 100, 10);



    var extras =  [__loadingHandler];
    __vis = new visualization();
    __vis.init("overlay", modules, extras);

    $("#overlay").attr("style","width:"+_width+"px;height:+"+_height+"px;");


    __screenWidth = _width//$(window).width();
    __screenHeight = _height//$(window).height();


    //set canvas high res
    document.querySelector("canvas").getContext("2d").scale(__resolutionModifier, __resolutionModifier);
    //init each module

    modules.forEach(function(m){
        if(m.init != undefined)
            m.init(__layout[m.name]);
    })
    if (modules[0].name == "CountryHandler")
        generateMap();
    //connect to socket.io
    var cb;
    if (modules[0].name == "CountryHandler")
    {
        cb = initCountries;
        if(modules.length == 1 && !__tabletop)
        {
            //only country, and it's probably an ipad, so fix map
            $("body").attr("class", "countryBody");
        }

    }
    else
    {
        cb = function(c){c();}
    }




    socket.on("update", function (msg) {
        cb(function() {


            var data = msg;
            modules.forEach(function (m) {
                m.update(data);
            });
            __loadingHandler.hide();

        });

    });
    socket.on("busy",function(){
        __loadingHandler.show();
    })
    socket.on("disconnect",function(){
        __loadingHandler.dc();
        //console.log("disconnected");
    })
    socket.emit("registerVisualization",{neeSession:__sessionID});

    var client;
    if(__tabletop) {

        //TUIO STUFF
        client = new Tuio.Client({
            host: "http://localhost:5000"
        }),

            onAddTuioCursor = function (addCursor) {
                var x = addCursor.getScreenX(__screenWidth);
                var y = addCursor.getScreenY(__screenHeight);
                __vis.addTouch(addCursor.cursorId, x, y);

            },

            onUpdateTuioCursor = function (updateCursor) {
                var x = updateCursor.getScreenX(__screenWidth);
                var y = updateCursor.getScreenY(__screenHeight);
                __vis.updateTouch(updateCursor.cursorId, x, y);


            },

            onRemoveTuioCursor = function (removeCursor) {
                //always remove, wherever finger is hovering
                __vis.removeTouch(removeCursor.cursorId);


            },

            onAddTuioObject = function (addObject) {
                ////console.log(addObject);
            },

            onUpdateTuioObject = function (updateObject) {
                ////console.log(updateObject);
            },

            onRemoveTuioObject = function (removeObject) {
                ////console.log(removeObject);
            },

            onRefresh = function (time) {
                ////console.log(time);
            };

        client.on("addTuioCursor", onAddTuioCursor);
        client.on("updateTuioCursor", onUpdateTuioCursor);
        client.on("removeTuioCursor", onRemoveTuioCursor);
        client.on("addTuioObject", onAddTuioObject);
        client.on("updateTuioObject", onUpdateTuioObject);
        client.on("removeTuioObject", onRemoveTuioObject);
        client.on("refresh", onRefresh);
        client.connect();
    }
    //add mouse click
    $("body").mousedown(function(e){

        var offset = $(this).offset();
        __vis.addTouch("mouse",(e.clientX - offset.left),(e.clientY - offset.top));
    });
    $("body").mousemove(function(e){
        var offset = $(this).offset();
        __vis.updateTouch("mouse",(e.clientX - offset.left),(e.clientY - offset.top));
    });


    $("body").on({ 'touchstart' : function(ev){

        ev.originalEvent.preventDefault();

        var touches = ev.originalEvent.changedTouches;
        for (var i = 0; i < touches.length; i++) {
            __vis.addTouch(touches[i].identifier,touches[i].pageX/2, touches[i].pageY/2);
        }
    }
    });
    /*$("body").touchstart(function(e){
     var touches = e.changedTouches;
     for (var i = 0; i < touches.length; i++) {
     __vis.addTouch(touches[i].identifier,touches[i].pageX, touches[i].pageY);
     }

     });*/
    $("body").mouseup(function(e){
        var offset = $(this).offset();
        __vis.removeTouch("mouse",(e.clientX - offset.left),(e.clientY - offset.top));
    });
    /*$("body").touchend(function(e){
     var touches = e.changedTouches;
     for (var i = 0; i < touches.length; i++) {
     __vis.removeTouch(touches[i].identifier,touches[i].pageX, touches[i].pageY);
     }

     });*/
    $("body").on({ 'touchend' : function(ev){
        ev.originalEvent.preventDefault();
        var touches = ev.originalEvent.changedTouches;
        for (var i = 0; i < touches.length; i++) {
            __vis.removeTouch(touches[i].identifier,touches[i].pageX/2, touches[i].pageY/2);
        }
    }
    });
    $("body").on({ 'touchmove' : function(ev){
        ev.originalEvent.preventDefault();
        var touches = ev.originalEvent.changedTouches;
        for (var i = 0; i < touches.length; i++) {
            __vis.updateTouch(touches[i].identifier,touches[i].pageX/2, touches[i].pageY/2);
        }
    }
    });
    $("canvas").on({'mousewheel DOMMouseScroll' : function(e){
        e.originalEvent.preventDefault();
        var offset = $(this).offset();
        __vis.scroll(e.originalEvent.deltaY, (e.clientX - offset.left),(e.clientY - offset.top));
    }});



}

function toggleFullScreen() {
    var doc = window.document;
    var docEl = doc.documentElement;

    var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        requestFullScreen.call(docEl);
    }
    else {
        cancelFullScreen.call(doc);
    }
}