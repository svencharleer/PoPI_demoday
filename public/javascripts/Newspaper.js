/**
 * Created by svenc on 17/06/15.
 */

//var colors = ["0xCCFF3E3E","0xCC7C4EE8","0xCC33F0FF","0xCC91E870","0xCCFFE085"];
var Scrollbar = function()
{
    var _offset = 0;
    var _x, _y, _w,_h,_l;
    var _touched = undefined;
    var _handler;
    return {
        "init" : function(x,y,w,h,l,handler)
        {
            _x = x;
            _y = y;
            _w = w;
            _h = h;
            _l = l;
            _handler = handler;
        },
        "draw" : function()
        {
            __p.rectMode(__p.CORNER);
            __p.fill(0);
            __p.rect(_x,_y,_w,_h);
            __p.fill(255);
            __p.rect(_x,_y + _offset, _w,_h/_l*_h);

        },
        "touch" : function(touches) {
            //only update when we let go
            if(_touched != undefined)
                _touched.alive = false;


            //old touches
            Object.keys(touches).some(function (t) {
                var touch = touches[t];

                if(_touched != undefined &&  touch.id == _touched.id) {
                    _touched.yChange = touch.y - _touched.y;
                    _touched.x = touch.x;
                    _touched.y = touch.y;
                    _touched.alive = true;
                }



                if (_touched != undefined && _touched.alive)
                    return true;
            });
            Object.keys(touches).some(function (t) {
                var touch = touches[t];
                //skip when a touch is being handled already

                if (_touched == undefined ) {


                    if (touch.x >= _x  + _handler.moduleOffset().x
                        && touch.x <= _x + _w + _handler.moduleOffset().x
                        && touch.y >= _y + _offset + _handler.moduleOffset().y
                        && touch.y <= _y +  _offset + _h/_l*_h + _handler.moduleOffset().y) {
                        _touched = JSON.parse(JSON.stringify(touch));
                        _touched.alive = true;
                        _touched.yChange = 0;

                    }

                }



            });
            if (_touched != undefined && _touched.alive) {
                _offset += _touched.yChange;

            }


            if (_touched != undefined && !_touched.alive )
            {
                _touched = undefined;
            }
        }  //_handler.callbackHandler(_selector);
        ,"offset":function(){return _offset/_h;}


    }


}


var Newspaper = function()
{

    var _name = "undefined";
    var _position = {x:10, y:10};
    var _size = {w:0,h:0};
    var _results = {count:0, prevCount:0};
    var _touched = undefined;
    var _handler;

    var _tween = 0;


    function drawWithColor(color,layerIndex)
    {
        var x = _position.x;
        var y = _position.y;
        var count = _tween * _results.count + (1.0-_tween) * _results.prevCount;
        if(count < 0) count = 0;
        var length = 0;

        if(count > 1)
            length = Math.log(count)*10;

        __p.noFill();

        __p.stroke(255);
        __p.rectMode(__p.CORNER);
        __p.rect(x,y,_size.w,_size.h);

        __p.fill(color);

        __p.noStroke();
        if(layerIndex != 0)
            __p.rect(x+2,y+20,length,4);
        else
            __p.rect(x+2,y+14,length, 2);

        __p.textFont(__fontThin);
        __p.textSize(12);
        __p.fill(255);
        __p.text(_name, x+2,y+2,200,20);

        __p.fill(color);
        __p.noStroke();
        if(layerIndex == 0) {
            __p.textFont(__fontThin);
            __p.textSize(12);
            __p.text(parseInt(count), x + _size.w- 50, y - 14);
        }
        else {
            __p.textFont(__fontHeavy);
            __p.textSize(14);
            __p.text(parseInt(count), x + _size.w- 50, y + 20);
        }
    }


    return {
        "init" : function(name, position, size, results, handler)
        {
            _name = name;

            _position = position;
            _size = size;
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
                if (_touched == undefined
                    && touch.x > _position.x + _handler.moduleOffset().x + _handler.scrollOffset().x
                    && touch.x < _position.x + _size.w  + _handler.moduleOffset().x + _handler.scrollOffset().x
                    && touch.y> _position.y  + _handler.moduleOffset().y + _handler.scrollOffset().y
                    && touch.y < _position.y + _size.h  + _handler.moduleOffset().y + _handler.scrollOffset().y
                    ) {


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
            drawWithColor(parseInt(colors[layerIndex]),layerIndex);
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
                _tween += .1;
            }
            if(_tween > 1.0)
                _tween = 1;
        },
        "position": function(){return _position;}

    }
}
var NewspaperHandler = function()
{
    var _newspapers = [];
    var _selectedNewspapers = [];
    var _otherFilters = [];
    var _offset = {x:100,y:40};
    var _width = 1024;
    var _height = 400;
    var _itemWidth = 500;
    var _itemHeight = 30;
    var _margin = 10;
    var _scroll = new Scrollbar();
    var _lastElementY = 0;


    function updateLayer(newspapers, layer,_this, original,previous) //oroginal added to support drawing of all countries on all layers, evn
    {
        //caclulate sizes
        var nrPerLine = parseInt(_width/_itemWidth);

        _newspapers[layer] = [];
        var lastElementY = 0;
        Object.keys(original).forEach(function(c,i) {
            var newspaper = new Newspaper();

            var count = 0;var prevCount =0;
            if(newspapers[c] != undefined)
                count = newspapers[c];
            if(previous[c] != undefined)
                prevCount = previous[c];

            newspaper.init(c,
                {x:  i%nrPerLine * _itemWidth, y:  parseInt(i/nrPerLine)*_itemHeight},{w:_itemWidth, h:_itemHeight},
                {count:count, prevCount:prevCount, query:""},
                _this);
            _newspapers[layer].push(newspaper);
            _lastElementY = parseInt(i/nrPerLine)*_itemHeight;

        });
        _scroll.init(700,0,30,_height,_lastElementY,_this);
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
            var ar = [];
            if(_newspapers.length > 0)
                ar = ar.concat(_newspapers[0]);
            ar.push(_scroll);
            return ar;
        },
        "draw":function() {

            __p.pushMatrix();
            __p.translate(_offset.x,_offset.y);
            _scroll.draw();
            __p.pushMatrix();
            __p.translate(0,-_scroll.offset()*_lastElementY);


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

                    if(np.c.position().y - _scroll.offset()*_lastElementY < _height && np.c.position().y - _scroll.offset()*_lastElementY > 0)


                    if (_selectedNewspapers.indexOf(np.c.title()) >= 0 || _selectedNewspapers.length == 0)
                        np.c.draw(color, _newspapers.length);
                    else
                        np.c.drawDim(color, _newspapers.length);



                });


            });
            __p.popMatrix();
            __p.popMatrix();
        },
        "moduleOffset":function(){return _offset},
        "scrollOffset" : function(){return {x:0, y:-_scroll.offset()*_lastElementY}}



    }
}

var __newspaperHandler = new NewspaperHandler()

