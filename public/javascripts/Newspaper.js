/**
 * Created by svenc on 17/06/15.
 */

//var colors = ["0xCCFF3E3E","0xCC7C4EE8","0xCC33F0FF","0xCC91E870","0xCCFFE085"];

var Newspaper = function()
{

    var _name = "undefined";
    var _position = {x:100, y:100};
    var _results = {count:0, prevCount:0};
    var _touched = undefined;
    var _handler;

    var _tween = 0;


    function drawWithColor(color)
    {
        var x = _position.x;
        var y = _position.y;
        var count = _tween * _results.count + (1.0-_tween) * _results.prevCount;

        var length = Math.log(count)*10;


        __p.fill(color);

        __p.noStroke();
        __p.rectMode(__p.CORNERS);
        __p.rect(x,y,x+length, y +10);

        __p.fill(0xCC4F4F51);
        __p.text(_name, x-10,y-5,200,20);

        __p.fill(color);
        __p.noStroke();
        __p.text(count, x-50,y-5);

    }


    return {
        "init" : function(name, position, results, handler)
        {
            _name = name;

            _position = position;
            _results = results;
            _handler = handler;
        },
        "title" : function()
        {
            return _name;
        },

        "touch" : function(touches)
        {
            var touchStillExists = false;
            Object.keys(touches).forEach(function(t){
                var touch = touches[t];
                if(_touched != undefined && _touched.id == touch.id) {
                    touchStillExists = true;
                    return true;
                }
                if (_touched == undefined && __p.dist(touch.x, touch.y, _position.x, _position.y) < 22) {


                        touchStillExists = true;
                        _touched = touch;
                        console.log("touched");
                        _handler.callbackHandler(_name);
                        return true;



                }
            })
            if(!touchStillExists) _touched = undefined;

        },

        "draw" : function(layerIndex, nrOfLayers)
        {
            drawWithColor(parseInt(colors[layerIndex]));
        },
        "drawDim": function(layerIndex, nrOfLayers)
        {
            var color = tinycolor(colors[layerIndex].replace("0xCC","#")).toHsv();
             color.v = color.v * .3;
             var rgb = tinycolor(color).toRgb();
             drawWithColor(__p.color(rgb.r, rgb.g, rgb.b));

        },
        "count" : function(){return _results.count;},
        "animate" : function()
        {
            if(_tween < 1.0)
            {
                _tween += .05;
            }
        }


    }
}
var NewspaperHandler = function()
{
    var _newspapers = [];
    var _selectedNewspapers = [];
    var _otherFilters = [];

    function updateLayer(newspapers, layer,_this, original,previous) //oroginal added to support drawing of all countries on all layers, evn
    {

        _newspapers[layer] = [];
        Object.keys(original).forEach(function(c,i) {
            var newspaper = new Newspaper();

            var count = 0;var prevCount =0;
            if(newspapers[c] != undefined)
                count = newspapers[c];
            if(previous[c] != undefined)
                prevCount = previous[c];
            newspaper.init(c,
                {x: 100 + parseInt(i/30) * 200, y: (i % 30)*30},
                {count:count, prevCount:prevCount, query:""},
                _this);
            _newspapers[layer].push(newspaper);

        });
    };
    return {
        "update": function(data)
        {


            var myData = getWidgetSpecificData("title", data[0]);
            _otherFilters = otherFilters("title", data); // see if there are other filters, needed for coloring correctly
            _newspapers = [];
            var originalLayer = myData.Facets[3]["TITLE"];


            var previousLayer = {};
            if(data.length > 1)
                previousLayer = getWidgetSpecificData("title", data[data.length-2]).Facets[3]["TITLE"];
            updateLayer(originalLayer,0,this,originalLayer,originalLayer);

            if(data.length > 1) {

                updateLayer(getWidgetSpecificData("title", data[data.length - 1]).Facets[3]["TITLE"], 1, this,originalLayer,previousLayer);
            }





        },
        "callbackHandler" : function(title)
        {
            //already selected?
            if(_selectedNewspapers.indexOf(title) >= 0)
            {
                socket.emit("removeFilter_Facet", {facetType: "title", facetValue:title });
                _selectedNewspapers.splice(_selectedNewspapers.indexOf(title),1);
            }
            else
            {
                socket.emit("addFilter_Facet", {facetType: "title", facetValue:title });
                _selectedNewspapers.push(title);
            }
        },
        "activeLayer":function()
        {
            if(_newspapers.length > 0)
                return _newspapers[0];
            return [];
        },
        "draw":function() {
            var allNewspapers = {};
            for (var i = _newspapers.length - 1; i >= 0; i--) {
                _newspapers[i].forEach(function (np) {
                    // country.draw(i, _countries.length);
                    if (allNewspapers[np.title()] == undefined)
                        allNewspapers[np.title()] = [];
                    allNewspapers[np.title()].push({c: np, i: i});
                })
            }
            Object.keys(allNewspapers).forEach(function (k) {
                //sort
                allNewspapers[k].sort(function (a, b) {
                    if (a.c.count() < b.c.count())
                        return 1;
                    if (a.c.count() > b.c.count())
                        return -1;
                    if (a.i < b.i)
                        return 1;
                    if (a.i > b.i)
                        return -1;
                    return 0;
                })
                allNewspapers[k].forEach(function (np, i, a) {
                    var color = 0;
                    if ((_selectedNewspapers.indexOf(np.c.title()) >= 0 && i == _newspapers.length-1) ||
                        (_otherFilters.length > 0 && i == _newspapers.length-1)) //if it's the top layer we draw, and other filters active, all goes blue there
                        color = 1;
                    np.c.animate();

                    if (_selectedNewspapers.indexOf(np.c.title()) >= 0 || _selectedNewspapers.length == 0)
                        np.c.draw(color, _newspapers.length);
                    else
                        np.c.drawDim(color, _newspapers.length);



                });


            });
        }


    }
}

var __newspaperHandler = new NewspaperHandler()

