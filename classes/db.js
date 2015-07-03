/**
 * Created by svenc on 03/07/15.
 */

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/ecloud');
//mongoose.connect('mongodb://ensor.cs.kuleuven.be:27017/sunshine');
//var server = new Server('ensor.cs.kuleuven.be', 27017, {auto_reconnect: true});

var db_connection = mongoose.connection;
db_connection.on('error', console.error.bind(console, 'connection error:'));
db_connection.once('open', function callback () {

    console.log("Connected to the database");

});


var Schema = mongoose.Schema;

var paperSchema = new Schema({
    //_id: String,
    groupID: String,
    userID: String,
    startTime: Date,
    endTime: Date,
    meta: {
        distance: Number,       //meters
        averageSpeed: Number,   //km/hour
        maxSpeed: Number,       //km/hour
        other: [Schema.Types.Mixed]  //free to do anything
    },
    sensorData: [
        {
            "sensorID": Number,   //Check http://ariadne.cs.kuleuven.be/wiki/index.php/PEnO3-1415
            "timestamp": Date,
            "data": [Schema.Types.Mixed]  //free to do anything
        }
    ]
},{collection:"biketrips"});

var imageSchema = new Schema({
    imageName: String,
    tripID : String,
    userID : String
    // raw: Schema.Types.Mixed  //encode as base64
},{collection:"files"});

var Trip = mongoose.model('Trip',tripSchema);
var Image = mongoose.model('Image',imageSchema);

exports.Trip = Trip;
exports.Image = Image;

/***************** QUERY METHODS *********************/

var queryAll = function() {

    var query = Trip.find({});
    //query.select({_id: 0});
    return query;
};