function scatterPlotChart () {
    var _chart = {};

    var _width = 600, _height = 600,
        _margins = {top: 40, left: 40, right: 40, bottom: 40},
        _x, _y,
        _data = [],
        _colors = d3.scaleOrdinal(d3.schemeCategory10),
        _svg,
        _bodyG,
        _brush,
        _symbolTypes = d3.scaleOrdinal() // <-A
                .range(["circle",
                    "cross",
                    "diamond",
                    "square",
                    "triangle-down",
                    "triangle-up"]);
    //渲染主函数
    _chart.render = function () {
        if (!_svg) {
            _svg = d3.select("body").append("svg")
                    .attr("height", _height)
                    .attr("width", _width);
            //绘制坐标轴
            renderAxes(_svg);

            //生成剪裁
            defineBodyClip(_svg);
        }

        //可视化绘制
        renderBody(_svg);
    };

    //渲染坐标轴函数
    function renderAxes(svg) {
        var axesG = svg.append("g")
                .attr("class", "axes");

        renderXAxis(axesG);

        renderYAxis(axesG);
    }
    
    //渲染坐标轴-X轴
    function renderXAxis(axesG){
        //定义坐标轴x
        var xAxis = d3.axisBottom(_x)
                        .tickSize(-quadrantHeight())
                        .tickFormat(d3.format(",.0f"));        

        //绘制坐标轴
        axesG.append("g")
                .attr("class", "x axis")
                .attr("transform", function () {
                   return "translate(" + xStart() + "," + yStart() + ")";
                })
                .call(xAxis);


        //设置grid-line的样式
        d3.selectAll("g.tick")
            .classed("grid-line", true);
        //设置坐标轴x边框样式
        d3.selectAll("g.x path")
            .classed("grid-line", true)


    }
    
    //渲染坐标轴-Y轴
    function renderYAxis(axesG){
        //定义坐标轴y
        var yAxis = d3.axisLeft(_y)
                        .tickSize(-quadrantWidth())
                        .tickFormat(d3.format(",.0f"));

        //绘制坐标轴        
        axesG.append("g")
                .attr("class", "y axis")
                .attr("transform", function () {
                    return "translate(" + xStart() + "," + yEnd() + ")";
                })
                .call(yAxis);
         
        //设置grid-line的样式       
        d3.selectAll("g.tick line")
            .classed("grid-line", true);
        //设置坐标轴x边框样式
        d3.selectAll("g.y path")
            .classed("grid-line", true);
    }

    //定义剪裁
    function defineBodyClip(svg) {
        var padding = 40;

        svg.append("defs")
                .append("clipPath")
                .attr("id", "body-clip")
                .append("rect")
                .attr("x", 0 - padding)
                .attr("y", 0)
                .attr("width", quadrantWidth() + 2 * padding)
                .attr("height", quadrantHeight());
    }

    //渲染可视化主体
    function renderBody(svg) {
        if (!_bodyG)
            _bodyG = svg.append("g")
                    .attr("class", "body")                    
                    .attr("transform", "translate(" 
                        + xStart() + "," 
                        + yEnd() + ")") 
                    .attr("clip-path", "url(#body-clip)");

        //渲染符号
        renderSymbols();
        //添加交互笔刷
        addBrush();
    }

    //渲染符号函数
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
                .attr("r", 4.5)
                .attr("cx", function(d) { return _x(d.A); })
                .attr("cy", function(d) { return _y(d.PO); });
    }

    //添加交互笔刷函数
    function addBrush(){
        _brush = d3.brush()
            .extent([[0,0],[quadrantWidth(),quadrantHeight()]])
            .on('start',brushstart)
            .on('brush',brushmove)
            .on('end',brushend);

        _bodyG.call(_brush);
        var brushCell;
        var selectArray = new Array();
        // Clear the previously-active brush, if any.
        function brushstart(p) {
            if (brushCell !== this) {
              selectArray = new Array();
              _bodyG.selectAll('.brush').call(_brush);
              var selectArray = new Array();
              brushCell = this;
            }
        }
        // Highlight the selected circles.
        function brushmove(p) {
            var e=d3.event.selection;
            var xmin=e[0][0],xmax=e[1][0];
            var ymin=e[0][1],ymax=e[1][1];
            d3.selectAll('.dot')
            .style('fill',function(d) {
                var x = d3.select(this).attr('cx');
                var y = d3.select(this).attr('cy');
                var circleId = d3.select(this).attr('id');
                if(x>xmin&&x<xmax&&y>ymin&&y<ymax){
                    d3.select(this).classed('circle-hidden', false);
                    if(selectArray.indexOf(circleId)==-1){
                      selectArray.push(circleId);
                    }
                }else{
                    d3.select(this).classed('circle-hidden', true);
                }
            });
            //salary_histogram.update(selectArray);
        }
        // If the brush is empty, select all circles.
        function brushend(p) {
            var e=d3.event.selection;
            if(e != null){
                var xmin=e[0][0],xmax=e[1][0];
                var ymin=e[0][1],ymax=e[1][1];
                if(((xmax - xmin) < 3)&&((ymax - ymin) < 3)){
                  _bodyG.selectAll(".circle-hidden").classed("circle-hidden", false);
                  selectArray = new Array(); 
                }
            }else{
                _bodyG.selectAll(".circle-hidden").classed("circle-hidden", false);
                selectArray = new Array(); 
            }
            //salary_histogram.update(selectArray);
        }

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

    //关联数据及坐标尺度
    _chart.pushData = function (d) {
        _data.push(d);
        _x = d3.scaleLinear().range([0, quadrantWidth()]);
        _y = d3.scaleLinear().range([quadrantHeight(), 0]);
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

