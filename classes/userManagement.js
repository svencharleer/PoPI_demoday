/**
 * Created by svenc on 28/04/15.
 */
var users = {};
//.id, .data, .color
var colors = ["0xCC8CFF6B","0xCCfff3a2","0xCCff1313","0xCC00deff","0xCCff03f0"];
var availableColors = [true,true,true,true,true];


var positionIdToUserId = {};
var hansolos = {};

exports.clearFlagsUser = function(id)
{
    if(users[id] != undefined) {
       users[id].dataUpdate = false;
    }
}

exports.userQuery = function(id, query)
{
    if(users[id] != undefined) {
        users[id].query = query;
    }
}

exports.updateUser = function(id,data,color,position)
{
    if(users[id] == undefined)
    {
        users[id] = {id:id, data:data, color:color};
        return;
    }
    if(data != undefined) {

        users[id].data = data;
        users[id].dataUpdate = true;
    }
    if(color != undefined)
        users[id].color = color;
    if(position != undefined) {
        //console.log("user position updated");
        users[id].position = {};
        users[id].position.x = position.x;
        users[id].position.y = position.y;
        users[id].position.id = position.id;
    }
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
        console.log("color comp: " + hansolos[h].color + " "  +color);
        if(hansolos[h].color == color)
        {
            console.log("match found");
            //if match, remove from han, put in the other list
            positionIdToUserId[hansolos[h].id] = {userId: userId, alive: true};
            exports.updateUser(userId, undefined, undefined, hansolos[h]);
            hansolos[h] = undefined;
            delete hansolos[h];
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
            //console.log(userId.userId + " is still alive");
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
    //deal with the dead. no way we can link them again with original user, so get rid of them
    Object.keys(positionIdToUserId).forEach(function(p){
        if(!positionIdToUserId[p].alive)
        {
           //remove from the data points
            exports.removeUser(positionIdToUserId[p]);
            positionIdToUserId[p] = undefined;
            delete positionIdToUserId[p];
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

    //actually what happens is we need to move hansolo to a real user
    //or in case of new hansolos, give them color
    Object.keys(hansolos).forEach(function(h){

       /* if(positionIdToUserId[hansolos[h].id] != undefined)
        {
            positionIdToUserId[hansolos[h].id].alive = true;
            exports.updateUser(positionIdToUserId[hansolos[h].id], undefined, undefined, hansolos[h]);
            hansolos[h] = undefined;
            delete hansolos[h];
        }
        else*/

            //we will just draw them for someone to grab
            //so give'm color
            if(hansolos[h].color == undefined)
            {
                hansolos[h].color = exports.getFirstAvailableColor();
                exports.colorAvailable(hansolos[h].color, false);
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
        if(user.color != undefined && user.position != undefined)
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