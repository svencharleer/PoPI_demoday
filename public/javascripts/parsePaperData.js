/**
 * Created by svenc on 24/04/15.
 */

var __paperPerUserData = {};

var parsePaperData = function(data, user)
{
    var results = data[0].Facets[0]["RECORD_SPATIAL"];
    Object.keys(results).forEach(function(cc){
        //add country to map if it doesn't exist yet
        addToMap(cc);
        //add the return values to the right node of the user
        if(__paperPerUserData[user] == undefined)
            __paperPerUserData[user] = {};
        __paperPerUserData[user][cc] = results[cc];
    });



}