/**
 * Created by svenc on 28/04/15.
 */
///////////////////////////////////////////
//         socket.io                  //
///////////////////////////////////////////
var filter = require('../classes/CentralFilter.js');
var rest = require('../classes/RESTful.js');
var processingRequests = 0;

var filterPerSession = {};

exports.init = function(ioWeb) {

    ioWeb.on('connection', function (socket) {


        var address = socket.handshake.address;
        console.log('Client connected with id: ' + socket.id + " from " + address.address + ":" + address.port);

        socket.on("registerVisualization", function (msg) {
            console.log("visualization active");
            socket.join('visualizationListener' + msg.neeSession);
            if(filterPerSession[msg.neeSession] == undefined)
                filterPerSession[msg.neeSession] = new filter.CentralFilter();

            //give them current state of the system
            filterPerSession[msg.neeSession].systemCall(function (data) {
                    socket.emit('update', data);

            });

        })
        socket.on("registerFilterActivities", function (msg) {
            socket.join('filterActivitiesListener' + msg.neeSession);
            if(filterPerSession[msg.neeSession] == undefined)
                filterPerSession[msg.neeSession] = new filter.CentralFilter();
            socket.emit('filterUpdate',
                filterPerSession[msg.neeSession].filterStack());
        })
        socket.on("registerResults", function (msg) {
            socket.join('resultListener' + msg.neeSession);
            if(filterPerSession[msg.neeSession] == undefined)
                filterPerSession[msg.neeSession] = new filter.CentralFilter();
        })
        socket.on('disconnect', function () {

            console.log(socket.id + " disconnecting");

        });

        socket.on("addFilter_Query", function (msg) {

            processingRequests++;
            ioWeb.sockets.emit("test");
            ioWeb.sockets.in('visualizationListener' + msg.neeSession).emit("busy");
            filterPerSession[msg.neeSession].newFilter_Query(msg.query);
            filterPerSession[msg.neeSession].systemCall(function (data) {
                processingRequests--;
                if(processingRequests == 0) {
                    ioWeb.sockets.in('visualizationListener' + msg.neeSession).emit('update', data);
                    ioWeb.sockets.in('filterActivitiesListener' + msg.neeSession).emit('filterUpdate',
                        filterPerSession[msg.neeSession].filterStack());
                }
            });
        });
        socket.on("removeFilter_Query", function (msg) {

            processingRequests++;
            ioWeb.sockets.emit("test");
            ioWeb.sockets.in('visualizationListener' + msg.neeSession).emit("busy");
            filterPerSession[msg.neeSession].disableFilter_Query(msg.query);
            filterPerSession[msg.neeSession].systemCall(function (data) {
                processingRequests--;
                if(processingRequests == 0) {
                    ioWeb.sockets.in('visualizationListener' + msg.neeSession).emit('update', data);
                    ioWeb.sockets.in('filterActivitiesListener' + msg.neeSession).emit('filterUpdate',
                        filterPerSession[msg.neeSession].filterStack());
                }
            });
        });
        socket.on("addFilter_Facet", function (msg) {
            processingRequests++;
            ioWeb.sockets.in('visualizationListener' + msg.neeSession).emit("busy");
            filterPerSession[msg.neeSession].newFilter_Facet(msg.facetType, msg.facetValue);
            filterPerSession[msg.neeSession].systemCall(function (data) {
                processingRequests--;
                if(processingRequests == 0) {
                    ioWeb.sockets.in('visualizationListener' + msg.neeSession).emit('update', data);
                    ioWeb.sockets.in('filterActivitiesListener' + msg.neeSession).emit('filterUpdate',
                        filterPerSession[msg.neeSession].filterStack());
                }
            });
        });
        socket.on("removeFilter_Facet", function (msg) {
            processingRequests++;
            ioWeb.sockets.in('visualizationListener' + msg.neeSession).emit("busy");
            filterPerSession[msg.neeSession].disableFilter_Facet(msg.facetType, msg.facetValue);
            filterPerSession[msg.neeSession].systemCall(function (data) {
                processingRequests--;
                if(processingRequests == 0) {
                    ioWeb.sockets.in('visualizationListener' + msg.neeSession).emit('update', data);
                    ioWeb.sockets.in('filterActivitiesListener' + msg.neeSession).emit('filterUpdate',
                        filterPerSession[msg.neeSession].filterStack());
                }
            });
        });
        socket.on("resetFilter", function (msg) {
            processingRequests++;
            ioWeb.sockets.in('visualizationListener' + msg.neeSession).emit("busy");
            filterPerSession[msg.neeSession].reset();
            filterPerSession[msg.neeSession].systemCall(function (data) {
                processingRequests--;
                if(processingRequests == 0) {
                    ioWeb.sockets.in('visualizationListener' + msg.neeSession).emit('update', data);
                    ioWeb.sockets.in('filterActivitiesListener' + msg.neeSession).emit('filterUpdate',
                        filterPerSession[msg.neeSession].filterStack());
                }
            });
        });
        socket.on("showResult", function(msg){
            console.log(msg);
            rest.scrapeURLFromEuropeana(msg.ID,function(url){
                ioWeb.sockets.in('resultListener' + msg.neeSession).emit('update', url);
            });

        });
        socket.on("getResults", function(msg){
            try{
                filterPerSession[msg.neeSession].getResults(function(data){
                ioWeb.sockets.in('visualizationListener' + msg.neeSession).emit('resultUpdate', data);
            })
            }
            catch(e)
            {
                console.log("getResults exc: " + e);
            }
        })
    });
}




