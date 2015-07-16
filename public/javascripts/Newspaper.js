/**
 * Created by svenc on 17/06/15.
 */


/**
 * Generates a GUID string.
 * @returns {String} The generated GUID.
 * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
 * @author Slavik Meltser (slavik@meltser.info).
 * @link http://slavik.meltser.info/?p=142
 */
function guid() {
    function _p8(s) {
        var p = (Math.random().toString(16)+"000000000").substr(2,8);
        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
}

var __blockSVG = undefined;
var __blockHSVG = undefined;

//var colors = ["0xCCFF3E3E","0xCC7C4EE8","0xCC33F0FF","0xCC91E870","0xCCFFE085"];
var Scrollbar = function()
{
    var _offset = 0;
    var _x, _y, _w,_h,_l;
    var _touched = undefined;
    var _handler;
    var _guid;
    var _this;
    var _imgArrowUp;
    var _imgArrowDown;
    var _initialized = false;
    function x(){
        return _x * _handler.scale() + _handler.offset().x
    }
    function y(){
        return _y * _handler.scale() + _handler.offset().y
    }
    function w(){
        return _w * _handler.scale();
    }
    function h(){
        return _h * _handler.scale();
    }
    return {
        "initialized" : function() { return _initialized;},
        "init" : function(x,y,w,h,l,handler)
        {
            _x = x;
            _y = y;
            _w = w;
            _h = h;
            _l = l;
            _handler = handler;
            _guid = guid();
            _this = this;
            if(_imgArrowUp == undefined)
                _imgArrowUp = __p.loadImage("/ecloud/images/arrow_up.png");
            if(_imgArrowDown == undefined)
                _imgArrowDown = __p.loadImage("/ecloud/images/arrow_down.png");
            _initialized = true;


        },
        "draw" : function()
        {
            __p.noStroke();
            __p.stroke(0xCC5E6C83);
            __p.line(_x,_y,_x,_y+_h);
            __p.line(_x+_w,_y,_x+_w,_y+_h);
            __p.stroke(255);
            __p.image(_imgArrowUp, _x+_w/2-_imgArrowUp.width/2,_y + _offset-_imgArrowUp.height/2);
            __p.image(_imgArrowDown, _x+_w/2-_imgArrowUp.width/2,_y + _offset+_h/_l*_h-_imgArrowUp.height/2)

            __p.line(_x,_y + _offset,_x,_y + _offset+_h/_l*_h);
            __p.line(_x+_w,_y + _offset,_x+_w,_y + _offset+_h/_l*_h);


        },
        "touch" : function(touches) {
            //only update when we let go
            if(_touched != undefined)
                _touched.alive = false;


            //old touches
            Object.keys(touches).some(function (t) {
                var touch = touches[t];
                if(touch.owner != undefined && touch.owner != _guid) return false;
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
                if(touch.owner != undefined && touch.owner != _guid) return false;
                if (_touched == undefined ) {


                    if (touch.x >= x()
                        && touch.x <= x() + w()
                        && touch.y >= y()
                        && touch.y <= y() + h())
                    {
                        _touched = JSON.parse(JSON.stringify(touch));
                        _touched.alive = true;
                        _touched.yChange = 0;
                        touch.owner = _guid;
                        touch.ownerObject = _this;

                    }

                }



            });
            if (_touched != undefined && _touched.alive) {
                _offset += _touched.yChange;
                if(_offset < 0) _offset = 0;
                if(_offset > _h-_h/_l*_h) _offset = _h-_h/_l*_h;

            }


            if (_touched != undefined && !_touched.alive )
            {
                _touched = undefined;
            }
        }  //_handler.callbackHandler(_selector);
        ,"offset":function(){return _offset/(_h-_h/_l*_h);}


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
    var _this;
    var _guid;

    function drawWithColor(color,layerIndex,selected)
    {
        var x =_position.x
        var y =_position.y
        var count = _tween * _results.count + (1.0-_tween) * _results.prevCount;
        if(count < 0) count = 0;
        var length = count/_handler.max()*(_size.w-50);

        __p.noFill();

        __p.pushMatrix();
        __p.translate(x,y)
        __p.scale(.5)

        var svg = selected ? __blockHSVG : __blockSVG;
        //__p.shapeMode(__p.CORNER);
        if(layerIndex == 0)
            __p.image(svg,0,0);//,_size.w,_size.h);
        __p.popMatrix();
        __p.fill(color);

        __p.noStroke();
        __p.rectMode(__p.CORNER);
        if(layerIndex != 0)
            __p.rect(x+8,y+45,length,2);
        else
            __p.rect(x+8,y+36,length, 2);

        __p.textAlign(__p.LEFT,__p.TOP)
        __p.textFont(__fontThin);
        __p.textSize(14);
        __p.fill(255);
        if(layerIndex == 0)
         __p.text(_name, x+7,y+10,_size.w,20);

        __p.fill(color);
        __p.noStroke();
        __p.textAlign(__p.LEFT,__p.TOP)
        if(layerIndex == 0) {
            __p.textFont(__fontThin);
            __p.textSize(10);
            __p.text(parseInt(count), x + 8 + length + 2, y+36-6, 30, 12);
        }
        else {
            __p.textFont(__fontThin);
            __p.textSize(10);
            __p.text(parseInt(count),x + 8 + length + 2, y+45-2, 30, 12);
        }
    }
    function x(){
        return _position.x * _handler.scale() + _handler.offset().x  + _handler.scrollOffset().x
    }
    function y(){
        return _position.y * _handler.scale() + _handler.offset().y  + _handler.scrollOffset().y
    }
    function w(){
        return _size.w * _handler.scale();
    }
    function h(){
        return _size.h * _handler.scale();
    }


    return {
        "init" : function(name, position, size, results, handler)
        {
            _name = name;
            _this = this;
            _position = position;
            _size = size;
            _results = results;
            _handler = handler;
            _guid = guid();
            if(__blockSVG == undefined){
                __blockSVG = __p.loadImage("/ecloud/images/block.png");
            }
            if(__blockHSVG == undefined){
                __blockHSVG = __p.loadImage("/ecloud/images/block_selected.png");
            }


        },
        "title" : function()
        {
            return _name;
        },

        "touch" : function(touches)
        {

            var touchStillExists = false;
            Object.keys(touches).some(function(t){
                var touch = touches[t];
                if(touch.owner != undefined && touch.owner != _guid) return false;
                if(_touched != undefined && _touched.id == touch.id) {
                    touchStillExists = true;
                    return true;
                }
                if (_touched == undefined
                    && touch.x > x()
                    && touch.x < x() + w()
                    && touch.y> y()
                    && touch.y < y() + h()
                    ) {
                        console.log("touched")

                        touchStillExists = true;
                        _touched = touch;


                        //own the touch!
                        touch.owner = _guid;
                        touch.ownerObject = _this;
                        return true;



                }
            })
            if(!touchStillExists) _touched = undefined;

        },
        "untouch": function(touch)
        {

            if (_touched != undefined && _touched.id == touch.id
                && touch.x > x()
                && touch.x < x() + w()
                && touch.y> y()
                && touch.y < y() + h()
                )
            {
                _handler.callbackHandler(_name);

            }
            _touched = undefined;
        },

        "drawSelected" : function(layerIndex, nrOfLayers)
        {
            drawWithColor(parseInt(colors[layerIndex]),layerIndex, true);
        },
        "draw": function(layerIndex, nrOfLayers)
        {

             drawWithColor(parseInt(colors[layerIndex]),layerIndex,false);

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
        "position": function(){return _position;},
        "setPosition": function(x,y){_position.x = x; _position.y = y}


    }
}
var NewspaperHandler = function()
{
    var _newspapers = [];
    var _selectedNewspapers = [];
    var _otherFilters = [];
    var _offset = {x:10,y:10};
    var _layout;
    var _scale;
    var _width = 1024;
    var _height = 400;
    var _itemWidth = 182;
    var _itemHeight = 62;
    var _margin = 10;
    var _scroll = new Scrollbar();
    var _lastElementY = 0;
    var _multilayer = false;
    var _allNewspapers = {};
    var _keysSorted = [];
    var _max = 0;
    var _imgTitle;
    function sortPapers()
    {

        _allNewspapers = {};
        for (var i = _newspapers.length - 1; i >= 0; i--) {
            _newspapers[i].forEach(function (np) {
                // country.draw(i, _countries.length);
                if (_allNewspapers[np.title()] == undefined)
                    _allNewspapers[np.title()] = [];
                _allNewspapers[np.title()].unshift({c: np, i: i});
            })
        }
        _keysSorted = Object.keys(_allNewspapers);
        //sort
        _keysSorted.sort(function (a, b) {
            var sortLayer = _multilayer ? 1 : 0 ;
            if (_allNewspapers[a][sortLayer].c.count() < _allNewspapers[b][sortLayer].c.count())
                return 1;
            if (_allNewspapers[a][sortLayer].c.count() > _allNewspapers[b][sortLayer].c.count())
                return -1;

            return 0;
        })
    }

    function updateLayer(newspapers, layer,_this, original,previous) //oroginal added to support drawing of all countries on all layers, evn
    {
        //caclulate sizes
        var nrPerLine = parseInt(_width/_itemWidth);

        _newspapers[layer] = [];
       console.log(JSON.stringify(original));
        Object.keys(original).forEach(function(c,i) {
            var newspaper = new Newspaper();

            var count = 0;var prevCount =0;
            if(newspapers[c] != undefined)
                count = newspapers[c];
            if(previous[c] != undefined)
                prevCount = previous[c];

            //set max
            if(_max < count) _max = count;
            newspaper.init(c,
                {x:0,y:0},{w:_itemWidth, h:_itemHeight},
                {count:count, prevCount:prevCount, query:""},
                _this);
            _newspapers[layer].push(newspaper);
            _lastElementY = parseInt(i/nrPerLine)*_itemHeight;

        });

        _scroll.init(_width-30,0,30,_height,_lastElementY,_this);
    };
    return {
        "init": function(layout)
        {


            _layout = layout;
          //  _scale = _layout.w > _layout.h ? _layout.h : _layout.w;
            _scale = 1;
            _offset.x = _layout.x * __screenWidth;
            _offset.y = _layout.y * __screenHeight;
            var w = __screenWidth * _layout.w;
            var h = __screenHeight* _layout.h;



           _width = w
          _height = h



          if(_imgTitle == undefined)
          {
              _imgTitle = __p.loadImage("/ecloud/images/title_newspapers.png");
          }

        },
        "update": function(data)
        {
            _max = 0;
            if(data.length == 1) //it's a reset, only one filter layer means show all, means reset has been hit
            {
                _selectedNewspapers = [];
            }

            var myData = getWidgetSpecificData("title", data[0]);
            _otherFilters = otherFilters("title", data); // see if there are other filters, needed for coloring correctly
            _newspapers = [];
            var originalLayer = myData["TITLE"];


            var previousLayer = {};
            if(data.length > 1) {
                previousLayer = getWidgetSpecificData("title", data[data.length - 2])["TITLE"];
                _multilayer = true
            }
            else
                _multilayer = false;
            updateLayer(originalLayer,0,this,originalLayer,originalLayer);

            if(data.length > 1) {

                updateLayer(getWidgetSpecificData("title", data[data.length - 1])["TITLE"], 1, this,originalLayer,previousLayer);
            }

            sortPapers();



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
            ar.push(_scroll);
            if(_newspapers.length > 0)
                ar = ar.concat(_newspapers[0]);

            return ar;
        },
        "draw":function() {


            __p.pushMatrix();
            __p.translate(_offset.x,_offset.y);
            __p.scale(_scale);
            __p.rectMode(__p.CORNER)
            __p.noFill();
            __p.stroke(155);
            __p.rect(0,0,_width, _height);
            if(_scroll.initialized()) _scroll.draw();
            __p.pushMatrix();
            __p.translate(0,-_scroll.offset()*_lastElementY);



            _keysSorted.forEach(function (k,j) {

                _allNewspapers[k].forEach(function (np, i, a) {
                    var color = 0;
                    if ((_selectedNewspapers.indexOf(np.c.title()) >= 0 && i == _newspapers.length-1) ||
                        (_otherFilters.length > 0 && i == _newspapers.length-1)) //if it's the top layer we draw, and other filters active, all goes blue there
                        color = 1;
                    np.c.animate();
                    var nrPerLine = parseInt((_width-30)/_itemWidth);
                    var x =  j%nrPerLine * _itemWidth;
                    //console.log(i);
                    var  y =  parseInt(j/nrPerLine)*(_itemHeight+10);
                    np.c.setPosition(x,y)
                    if(np.c.position().y - _scroll.offset()*_lastElementY <= _height && np.c.position().y - _scroll.offset()*_lastElementY >= 0)





                    if (_selectedNewspapers.indexOf(np.c.title()) >= 0)
                        np.c.drawSelected(color, _newspapers.length);
                    else
                        np.c.draw(color, _newspapers.length);



                });


            });
            __p.popMatrix();
            __p.popMatrix();
            //title of screen
            //might want to do differently when showing more on one screen
            //but for now outside matrix
            /*__p.pushMatrix()
            __p.scale(.5)
            var h = $(window).height()*2;
            __p.image(_imgTitle, 10,h-100)
            __p.popMatrix();*/
        },
        "moduleOffset":function(){return _offset},
        "scrollOffset" : function(){return {x:0, y:-_scroll.offset()*_lastElementY}},
        "max": function(){return _max;},
        "name": "NewspaperHandler",
        "offset": function(){return _offset;},
        "scale":function(){return _scale;},
        "boundingBox":function(){
            var w = $(window).width()* _layout.w;
            var h = $(window).height()* _layout.h;
            return {x1:_offset.x, x2:_offset.x + w, y1:_offset.y, y2: _offset.y + h};

        }



    }
}

var __newspaperHandler = new NewspaperHandler()


