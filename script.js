const width = 1500
const height = 400

var colorScale = d3.scaleThreshold()
  .domain(d3.range(2.6, 75.1, (75.1-2.6)/8))
  .range(d3.schemeBlues[7])

var color = d3.scaleThreshold()
    .domain(d3.range(2.6, 75.1, (75.1-2.6)/8))
    .range(d3.schemeGreens[9])

let colors = ["#cae1f7", "#add8ff", "#80b9ee", "#559ce4", "#0078d4", "#235a9f", "#174276", "#092642"]

let svg =  d3.select("#chart")
             .append("svg")
             .attr("width", width)
             .attr("height", height + 200)

let tooltip = d3.select("#chart")
                .append("div")
                .attr("id", "tooltip")

//Legend
let legend = svg.append("g")
                .attr("id", "legend")

for(var i=0;i<colors.length;i++){
     legend.append("g")
           .append("rect")
           .attr("x", width - (20 * (i+1)))
           .attr("y", height + 60)
           .attr("width", 20)
           .attr("height", 20)
           .attr("fill", colors[colors.length - 1 - i])
           .attr("transform", "translate(-200, -450)")
}

var path = d3.geoPath();
/*var projection = d3.geoMercator()
  .scale(70)
  .center([0,20])
  .translate([width / 2, height / 2]);*/

// Data to be used
const COUNTY_FILE = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';
const EDUCATION_FILE = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';

d3.queue()
  .defer(d3.json, COUNTY_FILE)
  .defer(d3.json, EDUCATION_FILE)
  .await(ready);

function ready(error, us, education) {
  if (error) throw error;
  
  svg.append("g")
     .selectAll("path")
     .data(topojson.feature(us, us.objects.counties).features)
     .enter()
     .append("path")
     .attr("class", "county")
     .attr("transform", "translate(475, -0)")
     /* .attr("d", d3.geoPath()
        .projection(projection)
      )*/
     .attr("data-fips", function(d) {
        return d.id
      })
     .attr("data-education", function(d) {
     let result = education.filter(function(obj) {
          return obj.fips == d.id;
        });
        if(result[0]){
          return result[0].bachelorsOrHigher
        }
          return 0
       })
  .attr("d", path)
     .attr("fill", function(d) { 
        var result = education.filter(function( obj ) {
          return obj.fips == d.id;
        });
        if(result[0]){
          return colorScale(result[0].bachelorsOrHigher)
        }
        //could not find a matching fips id in the data
        return colorScale(0)
       })
      .on("mouseover", function(d) {      
        tooltip.style("opacity", .9)
        tooltip.html(function() {
          let result = education.filter(function( obj ) {
            return obj.fips == d.id
          });
          if(result[0]){
            return result[0]['area_name'] + ', ' + result[0]['state'] + ': ' + result[0].bachelorsOrHigher + '%'
          }
        })
        .attr("data-education", function() {
        let result = education.filter(function( obj ) {
          return obj.fips == d.id;
        });
        if(result[0]){
          return result[0].bachelorsOrHigher
        }
       })
          .style("left", (d3.event.pageX + 10) + "px") 
          .style("top", (d3.event.pageY - 28) + "px"); }) 
          .on("mouseout", function(d) { 
            tooltip.style("opacity", 0)
          });

 svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "states")
      .attr("d", path)
      .attr("transform", "translate(475, 0)")
  /*.attr("fill", function (d) {
        d.total = data.get(d.id) || 0;
        return colorScale(d.total)
      });*/
}
