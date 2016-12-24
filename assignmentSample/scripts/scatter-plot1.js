var scatter_plot1 = {
    initialize: function(){
        var scatterPlot1Width = $('#scatter-plot1-svg').width();
        var scatterPlot1Height = $('#scatter-plot1-svg').height();
        var margin = {top: 10, right: 30, bottom: 30, left: 40},
            width = scatterPlot1Width - margin.left - margin.right,
            height = scatterPlot1Height - margin.top - margin.bottom;

        var x = d3.scaleLinear()
            .range([0, width]);

        var y = d3.scaleLinear()
            .range([height, 0]);

        var color = d3.scaleOrdinal(d3.schemeCategory10);

        var xAxis = d3.axisBottom(x);

        var yAxis = d3.axisLeft(y);

        var svg = d3.select("#scatter-plot1-svg").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr('id', 'scatter-plot-g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.csv("datasets/2015.csv", function(error, data) {
          if (error) throw error;
          data.forEach(function(d) {
            d.PO = +d.PO;
            d.A = +d.A;
          });
          x.domain(d3.extent(data, function(d) { return d.A; })).nice();
          y.domain(d3.extent(data, function(d) { return d.PO; })).nice();

          svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);

          svg.append("text")
              .attr("class", "label")
              .attr("x", width)
              .attr("y", height+28)
              .style("text-anchor", "end")
              .text("Assists");

          svg.append("g")
              .attr("class", "y axis")
              .call(yAxis);

          svg.append("text")
              .attr("class", "label")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("PutOut")

          svg.selectAll(".dot")
              .data(data)
              .enter()
              .append("circle")
              .attr("class", "dot")
              .attr("id", function(d,i){
                return d.playerID;
              })
              .attr("r", 3.5)
              .attr("cx", function(d) { return x(d.A); })
              .attr("cy", function(d) { return y(d.PO); })
              .style("fill", function(d) { return "steelblue"; });

          var brush = d3.brush()
            .extent([[0,0],[width,height]])
            .on('start',brushstart)
            .on('brush',brushmove)
            .on('end',brushend);

          svg.append("g").call(brush);
          var brushCell;
          var selectArray = new Array();
          // Clear the previously-active brush, if any.
          function brushstart(p) {
           if (brushCell !== this) {
              selectArray = new Array();
              svg.selectAll('.brush').call(brush);
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
            salary_histogram.update(selectArray);
          }
          // If the brush is empty, select all circles.
          function brushend(p) {
            var e=d3.event.selection;
            if(e != null){
              var xmin=e[0][0],xmax=e[1][0];
              var ymin=e[0][1],ymax=e[1][1];
              if(((xmax - xmin) < 3)&&((ymax - ymin) < 3)){
                  svg.selectAll(".circle-hidden").classed("circle-hidden", false);
                  selectArray = new Array(); 
              }
            }else{
              svg.selectAll(".circle-hidden").classed("circle-hidden", false);
              selectArray = new Array(); 
            }
            salary_histogram.update(selectArray);
          }
        });
    },
    update: function(select_obj_array){
      var svg = d3.select('#scatter-plot-g');
      if(select_obj_array.length == 0){
          svg.selectAll(".circle-hidden").classed("circle-hidden", false);
      }else{
          svg.selectAll(".dot").classed("circle-hidden", true);
          for(var i = 0;i < select_obj_array.length;i++){
            svg.select('#' + select_obj_array[i]).classed("circle-hidden", false);
          }
      }
    }
}
