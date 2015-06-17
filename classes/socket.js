/**
 * Created by svenc on 28/04/15.
 */
///////////////////////////////////////////
//         socket.io                  //
///////////////////////////////////////////
var paperLib = require('../classes/libCalls.js');
var userMgm = require('../classes/userManagement.js');

var pausePositions = false;
var _queries = [];



exports.init = function(ioWeb) {

    ioWeb.on('connection', function (socket) {


        var address = socket.handshake.address;
        console.log('Client connected with id: ' + socket.id + " from " + address.address + ":" + address.port);
        userMgm.updateUser(socket.id);

        socket.on('disconnect', function(){
            pausePositions = true;
            console.log(socket.id + " disconnecting");
            var usr = userMgm.getAllUsers()[socket.id];
            console.log(usr);
            if(usr == undefined) return;
            userMgm.colorAvailable(usr.color, true);
            userMgm.removeUser(socket.id);
            console.log(socket.id + " disconnected. " + usr.color+ " free again");
            var msg = {users: userMgm.getUsers(), solos: userMgm.grabSolos()};
            broadcastUpdate(msg);
            pausePositions = false;
        });


        //send the available colors to client
        socket.emit("availableColors",userMgm.getAvailableColors());

        socket.on('chooseColor', function(msg){
            pausePositions = true;
            var color = msg;
            userMgm.updateUser(socket.id, undefined, color);
            userMgm.colorAvailable(color, false);
            userMgm.matchUserToPosition(socket.id, color);
            socket.emit("chooseColor", color);
            console.log("choose color " + msg);
            msg = {users: userMgm.getUsers(), solos: userMgm.grabSolos()};
            broadcastUpdate(msg);
            pausePositions = false;
        });



        socket.on('doQuery', function (msg) {
            pausePositions = true;
            console.log('user: ' + socket.id + ' queried ' + msg.query);
            userMgm.userQuery(socket.id, msg.query);
            _queries.unshift(msg.query);

            paperLib.byYearAndLanguage(msg.query,"","", function (data, err) {

                console.log('user: ' + socket.id + ' queried with results ' + data);
                userMgm.updateUser(socket.id, data);


                socket.emit("queryResults", data != undefined ? 0 : 0 );
                var msg = {users: userMgm.getUsers(), solos: userMgm.grabSolos()};
                broadcastUpdate(msg);
                userMgm.clearFlagsUser(socket.id);
            });

            pausePositions = false;
        });
        socket.on("doSubQuery", function(msg){

            switch(msg.widget)
            {
                case "timeline":
                {
                    console.log("timeline call done " + msg.widget);
                    paperLib.byYearAndLanguage(msg.query,msg.facetType, msg.facetValue, function(data, err){
                        console.log("response to timeline is being sent");
                        ioWeb.sockets.in('visualizationListener').emit('subQueryResult_Timeline', data);
                    });

                    break;
                }
            }

        });

        socket.on("registerVisualization", function (msg) {
            socket.join('visualizationListener');
        })

        socket.on("registerPositions", function (msg) {
            socket.join('positionListener');
        });

        socket.on("registerInformation", function(msg){
            socket.join("informationListener");
        });
        socket.on("updatePositions", function (msg) {
            //console.log(msg);
            if(pausePositions) return;
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

        socket.on("show",function(msg){
            console.log(msg);
            //go over users and call queries
            var userKeys = Object.keys(userMgm.getUsers());
            recursivePaperCall(userKeys,msg);





        })


    });



    var recursivePaperCall = function(userKeys, country, data)
    {
        if(data == undefined)
            data = {};
        console.log(userKeys);
        if(userKeys.length > 0)
        {
            var key = userKeys.pop();;
            while(userMgm.getUsers()[key].query == undefined && userKeys.length > 0)
            {
                key = userKeys.pop();
            }
            if(userMgm.getUsers()[key].query  == undefined)
            {
                broadcastInformation(country, data);
                return;
            }
            paperLib.getPapersForCountry(userMgm.getUsers()[key].query, country, key, data, function (d, err) {

                recursivePaperCall(userKeys, country, d);
            });
        }
        else {
            //console.log("out of rec" + data)
            broadcastInformation(country, data);
        }


    };

///////////////////////////////////////////
//         BroadCasting                  //
///////////////////////////////////////////

    function broadcastUpdate(msg) {
        ioWeb.sockets.in('visualizationListener').emit('update', msg);
        var sysInfo = {
            nrOfUsers: Object.keys(msg.users).length,
            nrOfSolos: Object.keys(msg.solos).length,
            queries: _queries
        };
        ioWeb.sockets.in('informationListener').emit('systemUpdate', sysInfo);
    };

    function broadcastPositions(positions) {
        ioWeb.sockets.in('positionListener').emit('positionsUpdate', positions);
    }
    function broadcastInformation(country,data) {

        ioWeb.sockets.in('informationListener').emit('informationUpdate',  userMgm.getUsers(), country,data);
    }
}