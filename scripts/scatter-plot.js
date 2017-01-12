function scatterPlotChart () {
    var _chart = {};

    var _width = 500, _height = 500,
            _margins = {top: 30, left: 30, right: 30, bottom: 30},
            _x, _y,
            _data = [],
            _colors = d3.scaleOrdinal(d3.schemeCategory10),
            _svg,
            _bodyG,
            _symbolTypes = d3.scaleOrdinal() // <-A
                    .range(["circle",
                        "cross",
                        "diamond",
                        "square",
                        "triangle-down",
                        "triangle-up"]);

    _chart.render = function () {
        if (!_svg) {
            _svg = d3.select("body").append("svg")
                    .attr("height", _height)
                    .attr("width", _width);

            renderAxes(_svg);

            defineBodyClip(_svg);
        }

        renderBody(_svg);
    };

    function renderAxes(svg) {
        var axesG = svg.append("g")
                .attr("class", "axes");

        renderXAxis(axesG);

        renderYAxis(axesG);
    }
    
    function renderXAxis(axesG){
        _x = d3.scaleLinear().range([0, quadrantWidth()]);
        var xAxis = d3.axisBottom(_x);        

        axesG.append("g")
                .attr("class", "x axis")
                .attr("transform", function () {
                    return "translate(" + xStart() + "," + yStart() + ")";
                })
                .call(xAxis);
                
        d3.selectAll("g.x g.tick")
            .append("line")
                .classed("grid-line", true)
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", 0)
                .attr("y2", - quadrantHeight());
    }
    
    function renderYAxis(axesG){
        _y = d3.scaleLinear().range([quadrantHeight(), 0]);
        var yAxis = d3.axisLeft(_y);
                
        axesG.append("g")
                .attr("class", "y axis")
                .attr("transform", function () {
                    return "translate(" + xStart() + "," + yEnd() + ")";
                })
                .call(yAxis);
                
         d3.selectAll("g.y g.tick")
            .append("line")
                .classed("grid-line", true)
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", quadrantWidth())
                .attr("y2", 0);
    }

    function defineBodyClip(svg) {
        var padding = 5;

        svg.append("defs")
                .append("clipPath")
                .attr("id", "body-clip")
                .append("rect")
                .attr("x", 0 - padding)
                .attr("y", 0)
                .attr("width", quadrantWidth() + 2 * padding)
                .attr("height", quadrantHeight());
    }

    function renderBody(svg) {
        if (!_bodyG)
            _bodyG = svg.append("g")
                    .attr("class", "body")                    
                    .attr("transform", "translate(" 
                        + xStart() + "," 
                        + yEnd() + ")") 
                    .attr("clip-path", "url(#body-clip)");

        renderSymbols();
    }

    function renderSymbols() { // <-B
            
        //enter
        _bodyG.selectAll("circle").data(_data)
                .enter()
                .append("circle")
                .attr("class", "dot");                 

        //exit
        _bodyG.selectAll("circle").data(_data)
                .exit().remove();

        //update
        _bodyG.selectAll("circle").data(_data)
                .attr("r", 2.5)
                .attr("cx", function(d) { return _x(d.A); })
                .attr("cy", function(d) { return _y(d.PO); })
                .style("fill", function(d) { return "steelblue"; })
                .style("stroke", function(d){return "black"});  
    }

    function xStart() {
        return _margins.left;
    }

    function yStart() {
        return _height - _margins.bottom;
    }

    function xEnd() {
        return _width - _margins.right;
    }

    function yEnd() {
        return _margins.top;
    }

    function quadrantWidth() {
        return _width - _margins.left - _margins.right;
    }

    function quadrantHeight() {
        return _height - _margins.top - _margins.bottom;
    }

    _chart.width = function (w) {
        if (!arguments.length) return _width;
        _width = w;
        return _chart;
    };

    _chart.height = function (h) {
        if (!arguments.length) return _height;
        _height = h;
        return _chart;
    };

    _chart.margins = function (m) {
        if (!arguments.length) return _margins;
        _margins = m;
        return _chart;
    };

    _chart.colors = function (c) {
        if (!arguments.length) return _colors;
        _colors = c;
        return _chart;
    };

    _chart.x = function (x) {
        if (!arguments.length) return _x;
        _x = x;
        return _chart;
    };

    _chart.y = function (y) {
        if (!arguments.length) return _y;
        _y = y;
        return _chart;
    };


    _chart.data = function (dt) {
        if (!arguments.length) return _data;
    };

    _chart.pushData = function (d) {
        _data.push(d);
        _x = d3.scaleLinear().range([0, _width]);
        _y = d3.scaleLinear().range([_height, 0]);
        _x.domain(d3.extent(_data, function(d) { return d.A; })).nice();
        _y.domain(d3.extent(_data, function(d) { return d.PO; })).nice();

        return _chart;
    };
    

    return _chart;
}


var chart = scatterPlotChart();

d3.csv("data/2015.csv", function(error, dataset) {
  if (error) throw error;
  dataset.forEach(function(d) {
    d.PO = +d.PO;
    d.A = +d.A;
    chart.pushData({A: d.A, PO: d.PO});
  });
  chart.render();
});

