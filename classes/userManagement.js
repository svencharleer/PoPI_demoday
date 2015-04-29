/**
 * Created by svenc on 28/04/15.
 */
var users = {};
//.id, .data, .color
var colors = ["0xCC8CFF6B","0xCCfff3a2","0xCCff1313","0xCC00deff","0xCCff03f0"];
var availableColors = [true,true,true,true,true];


var positionIdToUserId = {};
var hansolos = {};

exports.updateUser = function(id,data,color,position)
{
    if(users[id] == undefined)
    {
        users[id] = {id:id, data:data, color:color};
        return;
    }
    if(data != undefined)
        users[id].data = data;
    if(color != undefined)
        users[id].color = color;
    if(position != undefined)
        users[id].position = position;
    if(data == "clear")
        users[id].data = undefined;
    if(color == "clear")
        users[id].color = undefined;
    if(position == "clear")
        users[id].position = undefined;



}

exports.matchUserToPosition = function(userId, color)
{
    //find a han that matches the color chosen by the user
    Object.keys(hansolos).forEach(function(h) {
        if(hansolos[h].color == color)
        {
            //if match, remove from han, put in the other list
            positionIdToUserId[hansolos[h].id] = {userId: userId, alive: true};
        }
    });
}

exports.updateUserPositions = function(positions)
{
    //all are dead until proven alive around the tabletop
    Object.keys(positionIdToUserId).forEach(function(p){
        positionIdToUserId[p].alive = false;
    });
    Object.keys(hansolos).forEach(function(h){
        hansolos[h].alive = false;
    });
    positions.forEach(function(position){
        position.x = parseFloat(position.x);
        position.y = parseFloat(position.y);
        var userId = positionIdToUserId[position.id];
        if(userId != undefined) {
            userId.alive = true;
            exports.updateUser(userId.userId, undefined, undefined, position);
            console.log(userId.userId + " is still alive");
        }
        else if(hansolos[position.id] != undefined) {

            hansolos[position.id].x = position.x;
            hansolos[position.id].y = position.y;
        }
        else if(hansolos[position.id] == undefined)
            hansolos[position.id] = position;
        if(hansolos[position.id] != undefined)
            hansolos[position.id].alive = true;
    });
    //deal with the dead. (they might just have stepped out the playing field)
    Object.keys(positionIdToUserId).forEach(function(p){
        if(!positionIdToUserId[p].alive)
        {
           //remove from the data points
            exports.updateUser(positionIdToUserId[p].userId, undefined, undefined, "clear"); //this will cause it not to be sent to clients
            console.log(positionIdToUserId[p].userId + " walked out");
        }
    });

    //there are still hansolos that might not be alive anymore, so get rid of those (people walking in and out without interaction)
    Object.keys(hansolos).forEach(function(h) {
        if(!hansolos[h].alive)
        {
            exports.colorAvailable(hansolos[h].color, true);
            hansolos[h] = undefined;
            delete hansolos[h];
        }

    });

    //color is link between lost user and active node!
    //deal with those who walk back into the scene
    //if they exist in posToUserId, they walked out
    //if they don't, they're new and need a color
    Object.keys(hansolos).forEach(function(h){
        if(positionIdToUserId[hansolos[h].id] != undefined)
        {
            positionIdToUserId[hansolos[h].id].alive = true;
            exports.updateUser(positionIdToUserId[hansolos[h].id], undefined, undefined, hansolos[h].position);
            hansolos[h] = undefined;
            delete hansolos[h];
        }
        else
        {
            //we will just draw them for someone to grab
            //so give'm color
            if(hansolos[h].color == undefined)
            {
                hansolos[h].color = exports.getFirstAvailableColor();
                exports.colorAvailable(hansolos[h].color, false);
            }
        }
    });



}

exports.grabSolos = function()
{
    return hansolos;
}

exports.removeUser = function(id)
{
    Object.keys(positionIdToUserId).forEach(function(p){
        if(positionIdToUserId[p].userId == id)
        {
            positionIdToUserId[p] = undefined;
            delete positionIdToUserId[p];
            return false;
        }
    });
    users[id] = undefined;
    delete users[id];
}


exports.getUsers = function()
{
    var ret = {};
    Object.keys(users).forEach(function(u){
        var user = users[u];
        if(user.data != undefined && user.color != undefined && user.position != undefined)
        {
            ret[user.id] = user;
        }
    });
    return ret;
}

exports.getAllUsers = function()
{
    return users;
}

exports.getAvailableColors = function() {
    var ret = [];
    /*colors.forEach(function (i) {
        if(availableColors[colors.indexOf(i)] == true)
            ret.push(i);
    });*/

    //get the colors from the solos
    Object.keys(hansolos).forEach(function(h){
       ret.push(hansolos[h].color);
    });
    return ret;
}


exports.getFirstAvailableColor = function() {
    var c = "0";
    colors.forEach(function (i) {
        if(availableColors[colors.indexOf(i)] == true) {
            c = i;
            return false;
        }
    });
    return c;
}

exports.colorAvailable = function(color, available)
{
    availableColors[colors.indexOf(color)] = available;
}