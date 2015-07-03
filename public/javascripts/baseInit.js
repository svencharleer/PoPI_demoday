/**
 * Created by svenc on 30/06/15.
 */
var __vis;

var loadAll = function(modules) {
    var _width = $(window).width();
    var _height = $(window).height();
    $("#overlay").width(_width);
    $("#overlay").height(_height);

    $("#map").width(_width);
    $("#map").height(_height);

    __loadingHandler.init(_width-100,10);
    generateMap();

    var extras = [__loadingHandler];
    __vis = new visualization();
    __vis.init("overlay", modules,extras);

    //connect to socket.io

    socket.emit("registerVisualization");
    socket.on("update", function (msg) {
        initCountries(function() {

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
        console.log("disconnected");
    })

    var client;
    if(__tabletop) {

        //TUIO STUFF
        client = new Tuio.Client({
            host: "http://localhost:5000"
        }),

            onAddTuioCursor = function (addCursor) {
                var x = addCursor.getScreenX(_width);
                var y = addCursor.getScreenY(_height);
                __vis.addTouch(addCursor.cursorId, x, y);

            },

            onUpdateTuioCursor = function (updateCursor) {
                var x = updateCursor.getScreenX(_width);
                var y = updateCursor.getScreenY(_height);
                __vis.updateTouch(updateCursor.cursorId, x, y);


            },

            onRemoveTuioCursor = function (removeCursor) {
                //always remove, wherever finger is hovering
                __vis.removeTouch(removeCursor.cursorId);


            },

            onAddTuioObject = function (addObject) {
                //console.log(addObject);
            },

            onUpdateTuioObject = function (updateObject) {
                //console.log(updateObject);
            },

            onRemoveTuioObject = function (removeObject) {
                //console.log(removeObject);
            },

            onRefresh = function (time) {
                //console.log(time);
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
        __vis.addTouch("mouse",e.clientX - offset.left,e.clientY - offset.top);
    });
    $("body").mousemove(function(e){
        var offset = $(this).offset();
        __vis.updateTouch("mouse",e.clientX - offset.left,e.clientY - offset.top);
    });


    $("body").on({ 'touchstart' : function(ev){
        ev.originalEvent.preventDefault();
        var touches = ev.originalEvent.changedTouches;
        for (var i = 0; i < touches.length; i++) {
            __vis.addTouch(touches[i].identifier,touches[i].pageX, touches[i].pageY);
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
        __vis.removeTouch("mouse",e.clientX - offset.left,e.clientY - offset.top);
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
            __vis.removeTouch(touches[i].identifier,touches[i].pageX, touches[i].pageY);
        }
    }
    });
    $("body").on({ 'touchmove' : function(ev){
        ev.originalEvent.preventDefault();
        var touches = ev.originalEvent.changedTouches;
        for (var i = 0; i < touches.length; i++) {
            __vis.updateTouch(touches[i].identifier,touches[i].pageX, touches[i].pageY);
        }
    }
    });



}