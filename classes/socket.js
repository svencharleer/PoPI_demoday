/**
 * Created by svenc on 28/04/15.
 */
///////////////////////////////////////////
//         socket.io                  //
///////////////////////////////////////////
var filter = require('../classes/CentralFilter.js');

exports.init = function(ioWeb) {

    ioWeb.on('connection', function (socket) {


        var address = socket.handshake.address;
        console.log('Client connected with id: ' + socket.id + " from " + address.address + ":" + address.port);

        socket.on("registerVisualization", function (msg) {
            socket.join('visualizationListener');
        })
        socket.on("registerFilterActivities", function (msg) {
            socket.join('filterActivitiesListener');
        })

        socket.on('disconnect', function () {

            console.log(socket.id + " disconnecting");

        });
        socket.on("addFilter_Query", function (msg) {

            filter.__centralFilter.newFilter_Query(msg.query);
            filter.__centralFilter.systemCall(function (data) {
                ioWeb.sockets.in('visualizationListener').emit('update', data);
                ioWeb.sockets.in('filterActivitiesListener').emit('filterUpdate',
                    filter.__centralFilter.filterStack());
            });
        });
        socket.on("addFilter_Facet", function (msg) {

            filter.__centralFilter.newFilter_Facet(msg.facetType, msg.facetValue);
            filter.__centralFilter.systemCall(function (data) {
                ioWeb.sockets.in('visualizationListener').emit('update', data);
                ioWeb.sockets.in('filterActivitiesListener').emit('filterUpdate',
                    filter.__centralFilter.filterStack());
            });
        });
        socket.on("removeFilter_Facet", function (msg) {

            filter.__centralFilter.disableFilter_Facet(msg.facetType, msg.facetValue);
            filter.__centralFilter.systemCall(function (data) {
                ioWeb.sockets.in('visualizationListener').emit('update', data);
                ioWeb.sockets.in('filterActivitiesListener').emit('filterUpdate',
                    filter.__centralFilter.filterStack());
            });
        });
        socket.on("resetFilter", function (msg) {

            filter.__centralFilter.reset();
            filter.__centralFilter.systemCall(function (data) {
                ioWeb.sockets.in('visualizationListener').emit('update', data);
                ioWeb.sockets.in('filterActivitiesListener').emit('filterUpdate',
                    filter.__centralFilter.filterStack());
            });
        });
    });
}




