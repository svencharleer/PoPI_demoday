/**
 * Created by svenc on 17/06/15.
 */

//var colors = ["0xCCFF3E3E","0xCC7C4EE8","0xCC33F0FF","0xCC91E870","0xCCFFE085"];

var NewspaperD3 = function()
{

    var _name = "undefined";
    var _position = {x:10, y:10};
    var _results = {count:0, prevCount:0};
    var _touched = undefined;
    var _handler;

    var _tween = 0;





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


        },

        "draw" : function(layerIndex, nrOfLayers)
        {
            //drawWithColor(parseInt(colors[layerIndex]),layerIndex);
        },
        "drawDim": function(layerIndex, nrOfLayers)
        {
            /*var color = tinycolor(colors[layerIndex].replace("0xCC","#")).toHsv();
             color.v = color.v * .3;
             var rgb = tinycolor(color).toRgb();
             drawWithColor(__p.color(rgb.r, rgb.g, rgb.b));*/

        },
        "d3draw" : function()
        {

        },
        "count" : function(){return _results.count;},
        "animate" : function()
        {
        },
        "position" : function() {return _position;}


    }
}
var NewspaperHandlerD3 = function()
{
    var _newspapers = [];
    var _selectedNewspapers = [];
    var _otherFilters = [];
    var _raw = [];

    function updateLayer(newspapers, layer,_this, original,previous) //oroginal added to support drawing of all countries on all layers, evn
    {
        _raw[layer] = newspapers;

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
            this.d3draw();




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
            //if(_newspapers.length > 0)
            //    return _newspapers[0];
            return [];
        },
        "draw": function(){}
        ,
        "d3draw":function() { //only done once compared with processing
            var layers = d3.nest()
                .key(function(d) { if(_raw[1] != undefined && _raw[1][d] != undefined)
                    return parseInt(_raw[1][d])
                    else
                    return parseInt(_raw[0][d])})
                .sortKeys(function(a,b)
                {
                    a = parseInt(a); b = parseInt(b);
                    if(a < b) return 1;
                    if(a > b) return -1;
                    return 0;
                })
                .key(function(d) { return d})
                .rollup(function(d){
                    if(_raw[1] != undefined)
                    console.log(_raw[1][d])
                    return [
                        _raw[0][d],
                        _raw[1] != undefined ? (_raw[1][d] != undefined ? _raw[1][d]:0) : undefined
                    ]
                })
                .entries(Object.keys(_raw[0]))
            var d3Div = d3.select("#d3");
            var papers = d3Div.selectAll("div").data(layers)
                ;

            papers.enter()
                .append("div")
                .text(function(d){return d.values[0].key})
                .append("svg")

                .attr("width",100)
                .attr("height",20)


            var p = papers.selectAll("svg").selectAll("rect").data(function(d) {
                return d.values[0].values
            })

                .attr("x", 10)
                .attr("y",function(d,i) {
                    return 10 + i * 3})
                .attr("width",function(d){
                    if(d == undefined) return 0;

                    return d/100})
                .attr("height",function(d){return 1;})
                .attr("stroke",function(d,i){ return colors[i].replace("0xCC","#")});
            p
                .enter()
                .append("rect")
                    .attr("x", 10)
                    .attr("y",function(d,i) {
                        return 10 + i * 3})
                    .attr("width",function(d){
                    if(d == undefined) return 0;

                        return d/100})
                    .attr("height",function(d){return 1;})
                    .attr("stroke",function(d,i){ return colors[i].replace("0xCC","#")})
                ;






        }


    }
}

var __newspaperHandlerD3 = new NewspaperHandlerD3();

