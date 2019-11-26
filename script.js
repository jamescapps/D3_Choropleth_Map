const width = 1500
const height = 400

const path = d3.geoPath()

const colors = ["#cae1f7", "#add8ff", "#80b9ee", "#559ce4", "#0078d4", "#235a9f", "#174276", "#092642"]
const colorScale = d3.scaleThreshold()
                     .domain(d3.range(2.6, 75.1, (75.1-2.6)/8))
                     .range(d3.schemeBlues[7])

const svg =  d3.select("#chart")
               .append("svg")
               .attr("width", width - 200)
               .attr("height", height + 200)
               .call(responsivefy)

const tooltip = d3.select("#chart")
                  .append("div")
                  .attr("id", "tooltip")

//Legend
const legend = svg.append("g")
                  .attr("id", "legend")

for(var i = 0; i < colors.length; i++){
     legend.append("g")
           .append("rect")
           .attr("x", width - (40 * (i+1)))
           .attr("y", height + 60)
           .attr("width", 40)
           .attr("height", 20)
           .attr("fill", colors[colors.length - 1 - i])
           .attr("transform", "translate(-455, -460)")
}

svg.append("g")
   .attr("class", "legendLabel")
   .append("text")
   .attr("x", width - (28 * (i+1)) + 20)
   .attr("y", height + 90)
   .attr("transform", "translate(-550, -450)")
   .text("3%" + "\xa0\xa0\xa0" + "12%" + "\xa0\xa0\xa0"+ "21%" + "\xa0\xa0\xa0" + "30%"+ "\xa0\xa0\xa0" +"39%" + "\xa0\xa0\xa0" +"48%" +  "\xa0\xa0\xa0" + "57%"+ "\xa0\xa0\xa0" + "66%")
d3.selectAll("text").style("fill","white") 



// Data to be used
d3.queue()
  .defer(d3.json, "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json")
  .defer(d3.json, "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json")
  .await(usa)

//Creates the map.
function usa(error, county, education) {
 if (error) throw error

  svg.append("g")
     .selectAll("path")
     .data(topojson.feature(county, county.objects.counties).features)
     .enter()
     .append("path")
     .attr("class", "county")
     .attr("transform", "translate(150, 0)")
     .attr("data-fips", d => d.id)
     .attr("data-education", d => {
        let result = education.filter(obj => obj.fips == d.id)
        if(result[0]){
          return result[0].bachelorsOrHigher
        }
       })
     .attr("d", path)
     .attr("fill", d => { 
        let result = education.filter(obj => obj.fips == d.id) 
        if(result[0]){
          return colorScale(result[0].bachelorsOrHigher)
        }
       })
      .on("mouseover", d => {      
        tooltip.style("opacity", .9)
        tooltip.html(() => {
          let result = education.filter(obj => obj.fips == d.id) 
          if(result[0]){
            return result[0]["area_name"] + ", " + result[0]["state"] + "  " + result[0].bachelorsOrHigher + "%"
          }
        })
        .attr("data-education", function() {
        let result = education.filter(obj => obj.fips == d.id)
        if(result[0]){
          return result[0].bachelorsOrHigher
        }
        })
        .style("left", (d3.event.pageX + 10) + "px") 
        .style("top", (d3.event.pageY - 28) + "px")
      }) 
      .on("mouseout", function(d) { 
          tooltip.style("opacity", 0)
      })

  svg.append("path")
     .datum(topojson.mesh(county, county.objects.states, (a, b) => a !==b))
     .attr("class", "states")
     .attr("d", path)
     .attr("transform", "translate(150, 0)")
}

 /* The below function makes the graph responsive.  It was taken from Ben Clinkinbeard's website and was  originally written by Brendan Sudol. https://benclinkinbeard.com/d3tips/make-any-chart-responsive-with-one-function/?utm_content=buffer976d6&utm_medium=social&utm_source=twitter.com&utm_campaign=buffer */
  
    function responsivefy(svg) {
    const container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style("width"), 10),
        height = parseInt(svg.style("height"), 10),
        aspect = width / height

    svg.attr("viewBox", `0 0 ${width} ${height}`)
       .attr("preserveAspectRatio", "xMinYMid")
       .call(resize);

    d3.select(window).on(
        "resize." + container.attr("id"), 
        resize
    )
    
    function resize() {
        const w = parseInt(container.style("width"))
        svg.attr("width", w)
        svg.attr("height", Math.round(w / aspect))
    }
  }
