/**
 * Created by svenc on 28/04/15.
 */
///////////////////////////////////////////
//         socket.io                  //
///////////////////////////////////////////
var filter = require('../classes/CentralFilter.js');
var rest = require('../classes/RESTful.js');
var processingRequests = 0;

exports.init = function(ioWeb) {

    ioWeb.on('connection', function (socket) {


        var address = socket.handshake.address;
        console.log('Client connected with id: ' + socket.id + " from " + address.address + ":" + address.port);

        socket.on("registerVisualization", function (msg) {
            console.log("visualization active");
            socket.join('visualizationListener');
            //give them current state of the system
            filter.__centralFilter.systemCall(function (data) {
                    socket.emit('update', data);

            });

        })
        socket.on("registerFilterActivities", function (msg) {
            socket.join('filterActivitiesListener');
        })
        socket.on("registerResults", function (msg) {
            socket.join('resultListener');
        })
        socket.on('disconnect', function () {

            console.log(socket.id + " disconnecting");

        });

        socket.on("addFilter_Query", function (msg) {

            processingRequests++;
            ioWeb.sockets.emit("test");
            ioWeb.sockets.in('visualizationListener').emit("busy");
            filter.__centralFilter.newFilter_Query(msg.query);
            filter.__centralFilter.systemCall(function (data) {
                processingRequests--;
                if(processingRequests == 0) {
                    ioWeb.sockets.in('visualizationListener').emit('update', data);
                    ioWeb.sockets.in('filterActivitiesListener').emit('filterUpdate',
                        filter.__centralFilter.filterStack());
                }
            });
        });
        socket.on("removeFilter_Query", function (msg) {

            processingRequests++;
            ioWeb.sockets.emit("test");
            ioWeb.sockets.in('visualizationListener').emit("busy");
            filter.__centralFilter.disableFilter_Query(msg.query);
            filter.__centralFilter.systemCall(function (data) {
                processingRequests--;
                if(processingRequests == 0) {
                    ioWeb.sockets.in('visualizationListener').emit('update', data);
                    ioWeb.sockets.in('filterActivitiesListener').emit('filterUpdate',
                        filter.__centralFilter.filterStack());
                }
            });
        });
        socket.on("addFilter_Facet", function (msg) {
            processingRequests++;
            ioWeb.sockets.in('visualizationListener').emit("busy");
            filter.__centralFilter.newFilter_Facet(msg.facetType, msg.facetValue);
            filter.__centralFilter.systemCall(function (data) {
                processingRequests--;
                if(processingRequests == 0) {
                    ioWeb.sockets.in('visualizationListener').emit('update', data);
                    ioWeb.sockets.in('filterActivitiesListener').emit('filterUpdate',
                        filter.__centralFilter.filterStack());
                }
            });
        });
        socket.on("removeFilter_Facet", function (msg) {
            processingRequests++;
            ioWeb.sockets.in('visualizationListener').emit("busy");
            filter.__centralFilter.disableFilter_Facet(msg.facetType, msg.facetValue);
            filter.__centralFilter.systemCall(function (data) {
                processingRequests--;
                if(processingRequests == 0) {
                    ioWeb.sockets.in('visualizationListener').emit('update', data);
                    ioWeb.sockets.in('filterActivitiesListener').emit('filterUpdate',
                        filter.__centralFilter.filterStack());
                }
            });
        });
        socket.on("resetFilter", function (msg) {
            processingRequests++;
            ioWeb.sockets.in('visualizationListener').emit("busy");
            filter.__centralFilter.reset();
            filter.__centralFilter.systemCall(function (data) {
                processingRequests--;
                if(processingRequests == 0) {
                    ioWeb.sockets.in('visualizationListener').emit('update', data);
                    ioWeb.sockets.in('filterActivitiesListener').emit('filterUpdate',
                        filter.__centralFilter.filterStack());
                }
            });
        });
        socket.on("showResult", function(msg){
            console.log(msg);
            rest.scrapeURLFromEuropeana(msg,function(url){
                ioWeb.sockets.in('resultListener').emit('update', url);
            });

        });
        socket.on("getResults", function(msg){
            try{
            filter.__centralFilter.getResults(function(data){
                ioWeb.sockets.in('visualizationListener').emit('resultUpdate', data);
            })
            }
            catch(e)
            {
                console.log("getResults exc: " + e);
            }
        })
    });
}




