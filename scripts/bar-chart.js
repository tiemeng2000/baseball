function barChart () {
    var _chart = {};

    var _width = 600, _height = 600,
        _margins = {top: 40, left: 40, right: 40, bottom: 40},
        _x, _y,
        _tx, _ty,
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
                        //.tickSize(-quadrantHeight());
                        //.tickFormat(d3.format(",.0f"));   

        //过滤刻度标识
        var ticks = _x.domain().filter(function(d,i){ return !(i%10); } );          
        xAxis.tickValues( ticks );     

        //绘制坐标轴
        axesG.append("g")
                .attr("class", "x axis")
                .attr("transform", function () {
                   return "translate(" + xStart() + "," + yStart() + ")";
                })
                .call(xAxis)                
                .append("text")                    
                    .attr("x", quadrantWidth()+10)
                    .attr("dx", "0.1em")
                    .attr("text-anchor", "end")
                    .attr("fill","#000")
                    .attr("font-size","10px")
                    .text(_tx);


        //设置grid-line的样式
        d3.selectAll("g.tick")
            .classed("grid-line", false);

        //设置坐标轴x边框样式
        d3.selectAll("g.x path")
            .classed("grid-line", true);




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
                .call(yAxis)
                .append("text")
                    .attr("y", -15)
                    .attr("dy", "0.1em")
                    .attr("text-anchor", "end")
                    .attr("fill","#000")
                    .attr("font-size","10px")
                    .text(_ty);
         
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
        renderBars();
        //添加交互笔刷
        addBrush();
    }


    //渲染符号函数
    function renderBars() { 

        //定义bar的间距
        var barPadding = 2;

        var bars = _bodyG.selectAll("rect.bar").data(_data);

        //update
        bars.enter()
            .append("rect")
            .attr("class","bar")
            .attr("x", function(d) { return _x(d.x); })
            .attr("y", function(d) { return _y(+d.y); })
            .attr("height", function(d) { return quadrantHeight() - _y(+d.y); })
            .attr("width",function(d) { return Math.floor(quadrantWidth()/_data.length)-barPadding}); 

        //exit          
        bars.exit().remove();

        // //update
        // bars.attr("class","bar");

        // //exit
        // bars.exit().remove();

        // //enter
        // bars=bars.enter().append("rect")            
        //     .transition()
        //     .attr("x", function(d) { return _x(d.x); })
        //     .attr("y", function(d) { return _y(+d.y); })
        //     .attr("height", function(d) { return yStart() - _y(+d.y); })
        //     .attr("width",function(d) { return Math.floor(quadrantWidth()/_data.length)-barPadding})
        //     .merge(bars)
        //     .attr("class","bar");
    }


    //添加交互笔刷函数
    function addBrush(){
        // //定义笔刷
        // _brush = d3.brush()
        //     .extent([[0,0],[quadrantWidth(),quadrantHeight()]])
        //     .on('start',brushstart)
        //     .on('brush',brushmove)
        //     .on('end',brushend);

        // //调用笔刷
        // _bodyG.call(_brush);
        // var brushCell;
        // var selectArray = new Array();

        // //清除已有笔刷
        // function brushstart(p) {
        //     if (brushCell !== this) {
        //         selectArray = new Array();
        //         _bodyG.selectAll('.brush').call(_brush);
        //         var selectArray = new Array();
        //         brushCell = this;
        //     }
        // }

        // //高亮备选散点.
        // function brushmove(p) {
        //     var e=d3.event.selection;
        //     var xmin=e[0][0],xmax=e[1][0];
        //     var ymin=e[0][1],ymax=e[1][1];
        //     d3.selectAll('.dot')
        //     .style('fill',function(d) {
        //         var x = d3.select(this).attr('cx');
        //         var y = d3.select(this).attr('cy');
        //         var circleId = d3.select(this).attr('id');
        //         if(x>xmin&&x<xmax&&y>ymin&&y<ymax){
        //             d3.select(this).classed('circle-hidden', false);
        //             if(selectArray.indexOf(circleId)==-1){
        //               selectArray.push(circleId);
        //             }
        //         }else{
        //             d3.select(this).classed('circle-hidden', true);
        //         }
        //     });            
        // }

        // // 如果笔刷为空，圈选散点
        // function brushend(p) {
        //     var e=d3.event.selection;
        //     if(e != null){
        //         var xmin=e[0][0],xmax=e[1][0];
        //         var ymin=e[0][1],ymax=e[1][1];
        //         if(((xmax - xmin) < 3)&&((ymax - ymin) < 3)){
        //           _bodyG.selectAll(".circle-hidden").classed("circle-hidden", false);
        //           selectArray = new Array(); 
        //         }
        //     }else{
        //         _bodyG.selectAll(".circle-hidden").classed("circle-hidden", false);
        //         selectArray = new Array(); 
        //     }            
        // }

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

    _chart.symbolTypes = function(c){
        if (!arguments.length) return _symbolTypes;
        _symbolTypes = c;
        return _symbolTypes;
    }

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

    _chart.tx = function (tx) {
        if (!arguments.length) return _tx;
        _tx = tx;
        return _chart;
    };

    _chart.ty = function (ty) {
        if (!arguments.length) return _ty;
        _ty = ty;
        return _chart;
    };

    _chart.data = function (dt) {
        if (!arguments.length) return _data;
    };

    //关联数据及坐标尺度
    _chart.pushData = function (d) {
        _data.push(d);
        _x = d3.scaleBand().rangeRound([0, quadrantWidth()], .2, 1);
        _y = d3.scaleLinear().range([quadrantHeight(), 0]);
        _x.domain( _data.map( function(d){ return d.x; } ) );
        _y.domain( [0, d3.max( _data, function(d){return d.y;} ) ]);

        return _chart;
    };
    

    return _chart;
}

//绘制Scatterplot
var barchart = barChart();
var test;
d3.csv("data/2015.csv", function(error, dataset) {
    if (error) throw error;
    dataset.forEach(function(d) {
        d.Salaries = +d.Salaries;
    //barChart.pushData(d.Salaries);
    });

    //d.Salaries的最大值和最小值
    var range_Salaries = d3.extent(dataset, function(d,i){
        return d.Salaries;
    });


    //设置直方图跨度
    var salariesBand = 1000000;

    //求直方图数量
    var bandNum = Math.ceil(range_Salaries[1]/salariesBand);
    
    //构造直方图数据数组为二维数组
    var bandArrayData = new Array(bandNum)
    for(var i=0; i<bandArrayData.length; i++){
        bandArrayData[i] = new Array();
    }

    //填充直方图数据数组
    dataset.forEach(function(d) {
        //计算每个数据属于哪个直方图
        var index_band = Math.floor(+d.Salaries / salariesBand);
        
        //在该直方图内填入相应的 playerID
        bandArrayData[index_band].push(d.playerID);
    });

    //构造直方图数组
    var bandArray = new Array();
    bandArrayData.forEach(function(d,i){
        bandArray[i] = new Object();
        if(d.length!=0){
            bandArray[i].num = d.length;            
        }
        else {
            bandArray[i].num = 0;
        }
        bandArray[i].label = i*salariesBand/1000+'k-'+(i+1)*salariesBand/1000+'k';
    });

    bandArray.forEach(function(d){
        d.num = +d.num;
        barchart.pushData({x: d.label, y: d.num});
    });



  barchart.tx("Salaries");
  barchart.ty("Counts");
  barchart.render();
});
