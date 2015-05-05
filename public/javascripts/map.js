/**
 * Created by svenc on 24/04/15.
 */

var countryToCoordinates = {
  LVA: [57.0000,25.0000],
  DEU: [52.5167,13.3833],
  SWE: [57.3500,18.0667],
    AUT:[48.2000,16.3500],
    CZE:[49.7500,15.7500],
    RUS:[57.0000,35.0000],
    FRA:[47.0000,2.0000],
    NLD:[52.3167,5.5500],
    ESP:[41.4333,3.7000],
    GBR:[51.5000,0.1167],
    BEL:[50.85,4.35],
    LTU:[55,24],
    HUN:[47.4333,19.2500],
    CHE:[46.8333,8.3333],
    NOR:[8.3333,8.0000]
};

var countryAbbrToName = {
    LVA: "Latvia",
    DEU: "Germany",
    SWE: "Sweden",
    AUT:"Austria",
    CZE:"Czech",
    RUS:"Russia",
    FRA:"France",
    NLD:"Netherlands",
    ESP:"Spain",
    GBR:"United Kingdom",
    BEL:"Belgium",
    LTU:"Lithuania",
    HUN:"Hungary",
    CHE:"Switzerland",
    NOR:"Norway"
}

var map;

var squares = {};

var getCountries = function()
{
    var countries = [];
    Object.keys(countryToCoordinates).forEach(function(c){
        var point = map.latLngToLayerPoint(countryToCoordinates[c]);
        countries.push({name: countryAbbrToName[c], x: point.x-20, y: point.y-20});
    });
    return countries;
}

var generateMap = function()
{
    map = L.map('map',{ zoomControl:false }).setView([50.9000, 18.3167], 5);
    L.tileLayer('http://api.tiles.mapbox.com/v4/svencharleer.2b20ff07/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic3ZlbmNoYXJsZWVyIiwiYSI6IllXNkdIaG8ifQ.ISDLLDx44LQ2JKuxebfqSA', {
        attribution: 'Augment Human - HCI Research Group - KU Leuven',
        maxZoom: 18
    }).addTo(map);
}

var width = 1.8;
var height = .6;

var convertMapCoordToScreen = function(user)
{
    if(user.data == undefined) return;
    var countries = user.data[0].Facets[0]["RECORD_SPATIAL"];
    Object.keys(countries).forEach(function(cc) {

        if(countryToCoordinates[cc] == undefined)
        {
            //WE NEED TO ADD THE CODE
            console.log("country code not found: " + cc);
            return;
        }
        var coords = countryToCoordinates[cc].slice();
        if(user.screenCoords == undefined)
        {
            user.screenCoords = {};

        }

        user.screenCoords[cc] = map.latLngToLayerPoint(coords); //convert
        user.data[cc] = countries[cc];
    });
}

/*var addToMap = function(countryCode)
{
    //already added to map, delete
    if(squares[countryCode] != undefined) return;

    if(countryToCoordinates[countryCode] == undefined)
    {
        //WE NEED TO ADD THE CODE
        console.log("country code not found: " + countryCode);
        return;
    }
    var bounds = [countryToCoordinates[countryCode].slice(),countryToCoordinates[countryCode].slice()];
    bounds[0][0] -= height/2;
    bounds[1][0] += height/2;
    bounds[0][1] -= width/2;
    bounds[1][1] += width/2;
    var square = L.rectangle(bounds, {
        fillColor: 'grey',
        fill: true,
        stroke: true,
        color: "#ff7800", weight: 1
    }).addTo(map);

    squares[countryCode] = {square: square, center:countryToCoordinates[countryCode],sats:{}};
}

var padding = .5;
var updateUser = function(userId, userColor, userPosition, userData)
{

   Object.keys(squares).forEach(function(k){
       var square = squares[k];
       var center = square.center;

       var offset = [(userPosition[1] * (height + padding)) - (height/2+padding/2), (userPosition[0] * (width + padding))-(width/2+padding/2)];


       if(square[userId] == undefined) {
           var circle = L.circleMarker([center[0] - offset[0], center[1] + offset[1]], {
               fillColor: userColor,
               fill: true,
               fillOpacity: 1,
               stroke: true,
               color: userColor, weight: 1
           }).addTo(map);
           circle.setRadius(3);
           square[userId] = circle;

       }
       else
       {
           //user already on this node, just update position
           circle.setLatLng([center[0] - offset[0], center[1] + offset[1]]);
       }



   });
}*/