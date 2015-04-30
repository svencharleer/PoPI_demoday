/**
 * Created by svenc on 28/04/15.
 */
///////////////////////////////////////////
//         socket.io                  //
///////////////////////////////////////////
var paperLib = require('../classes/libCalls.js');
var userMgm = require('../classes/userManagement.js');
exports.init = function(ioWeb) {

    ioWeb.on('connection', function (socket) {

        var address = socket.handshake.address;
        console.log('Client connected with id: ' + socket.id + " from " + address.address + ":" + address.port);
        userMgm.updateUser(socket.id);

        socket.on('disconnect', function(){
            console.log(socket.id + " disconnecting");
            var usr = userMgm.getAllUsers()[socket.id];
            console.log(usr);
            if(usr == undefined) return;
            userMgm.colorAvailable(usr.color, true);
            userMgm.removeUser(socket.id);
            console.log(socket.id + " disconnected. " + usr.color+ " free again");
            var msg = {users: userMgm.getUsers(), solos: userMgm.grabSolos()};
            broadcastUpdate(msg);
        });


        //send the available colors to client
        socket.emit("availableColors",userMgm.getAvailableColors());

        socket.on('chooseColor', function(msg){
            var color = msg;
            userMgm.updateUser(socket.id, undefined, color);
            userMgm.colorAvailable(color, false);
            userMgm.matchUserToPosition(socket.id, color);
            socket.emit("chooseColor", color);
            console.log("choose color " + msg);
            msg = {users: userMgm.getUsers(), solos: userMgm.grabSolos()};
            broadcastUpdate(msg);
        });



        socket.on('doQuery', function (msg) {

            console.log('user: ' + socket.id + ' queried ' + msg.query);
            paperLib.getPapersByAt(msg.query, 10, 0, function (data, err) {

                console.log('user: ' + socket.id + ' queried with results ' + data);
                userMgm.updateUser(socket.id, data);

                socket.emit("doQuery", "processing")
                var msg = {users: userMgm.getUsers(), solos: userMgm.grabSolos()};
                broadcastUpdate(msg);
            });
        });


        socket.on("registerVisualization", function (msg) {
            socket.join('visualizationListener');
        })

        socket.on("registerPositions", function (msg) {
            socket.join('positionListener');
        });

        socket.on("updatePositions", function (msg) {
            console.log(msg);
            var positions = JSON.parse(msg);
            userMgm.updateUserPositions(positions);
            var msg = {users: userMgm.getUsers(), solos: userMgm.grabSolos()};
            broadcastUpdate(msg);

        });

        socket.on("kinectOK", function (msg) {
            console.log("Kinect is up and running")
        });
        socket.on("kinectKO", function (msg) {
            console.log("Kinect messed up")
        })

    });

///////////////////////////////////////////
//         BroadCasting                  //
///////////////////////////////////////////

    function broadcastUpdate(msg) {
        ioWeb.sockets.in('visualizationListener').emit('update', msg);
    };

    function broadcastPositions(positions) {
        ioWeb.sockets.in('positionListener').emit('positionsUpdate', positions);
    }
}