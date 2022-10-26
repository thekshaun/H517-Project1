const PATH_WIDTH_ADDITION = 25
let pumpsData = []
let processedStreetData = []
let deathByGenderData = []
let deathByDaysData = []
let deathByGenderDataFinal = []
let deathDistributionByAge = [];
let deathDistributionBySex = [];
const adjustmentVar = 23;
let count = 0, count2 = 0;

let deathsLabel = document.getElementById("deaths-label");
let ageSelect = document.getElementById("age-select");

const parseDate = d3.timeParse("%d-%b");

// Loading Data
d3.json("./street.json").then((data) => { 
    drawMap(data) 
})

d3.csv("./pumps.csv", function (data) {
    pumpsData.push(data)
    drawPump(pumpsData)
});

d3.csv("./deaths_age_sex.csv", function (data) {
    deathByGenderData.push(data)
    count2 += 1;

    if(count2 >= 571) {
        loadDeathByDaysData();
    }
});

const loadDeathByDaysData = () => {
    d3.csv("./deathdays.csv", function (data) {
        let newData = {originalDate: data.date, date:parseDate(data.date), deaths:parseInt(data.deaths)}
        deathByDaysData.push(newData)
        count += 1;
        if(count == 42) {
            plotDeathsbyDays(deathByDaysData)
            processDataByLocation()
        }
    });
}

// Defining margins and graphs
var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

let mapSvg = d3.select('#svg1')
    .attr('width', 600)
    .attr('height', 570)

let lineChart = d3.select('#svg2')
    .attr('width', 600)
    .attr('height', 570)

var barSvg1 = d3.select("#bargraph1")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
        
var barSvg2 = d3.select("#bargraph2")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
  

// Helper functions    
const getDateString = (date) => {
    return date.getMonth()+"-"+date.getDate();
}

const getFormattedDate = (date) => {
    if(date.getMonth() == 7) {
        return "August "+ date.getDate()
    }
    else if(date.getMonth() == 8) {
        return "September "+ date.getDate()
    }
}

// Functions for drawing the map
const processDataByLocation = () => {
    currentIndex = 0;

    for(let i=0; i<deathByDaysData.length; i++) {
        for(let j=0; j<deathByDaysData[i].deaths; j++) {
            deathByGenderDataFinal[currentIndex] = {...deathByGenderData[currentIndex], date: deathByDaysData[i].date }
            currentIndex = currentIndex + 1;
        }
    }

    let maleDeathsBySex = 0, femaleDeathsBySex = 0;
    for(let i=0; i<deathByGenderData.length; i++) {
        if(deathByGenderData[i].gender === "0") {
            maleDeathsBySex+=1;
        }
        else if(deathByGenderData[i].gender === "1") {
            femaleDeathsBySex += 1;
        }
    }

    deathDistributionBySex = [
        {gender: "Male", deaths: maleDeathsBySex},
        {gender: "Female", deaths: maleDeathsBySex},
        // {gender: "Overall", deaths: maleDeathsBySex+femaleDeathsBySex}
    ]

    let ageGroups = [0,0,0,0,0,0,0,0];
    let ageGroupLabels = ["0-10", "11-20", "21-40", "41-60", "61-80", ">80"]
    let totalDeaths = 0;

    for(let i=0; i<deathByGenderData.length; i++) {
        let ageGroup = parseInt(deathByGenderData[i].age);
        
        ageGroups[ageGroup] +=1;
        totalDeaths += 1;
    }

    deathDistributionByAge = [
        {ageGroup: ageGroupLabels[0], deaths: ageGroups[0]},
        {ageGroup: ageGroupLabels[1], deaths: ageGroups[1]},
        {ageGroup: ageGroupLabels[2], deaths: ageGroups[2]},
        {ageGroup: ageGroupLabels[3], deaths: ageGroups[3]},
        {ageGroup: ageGroupLabels[4], deaths: ageGroups[4]},
        {ageGroup: ageGroupLabels[5], deaths: ageGroups[5]},
        // {ageGroup: "Overall", deaths: totalDeaths}
    ]

    plotDeathByGender(deathByGenderDataFinal)
    plotDeathDistributionBySex(deathDistributionBySex)
    plotDeathDistributionByAge(deathDistributionByAge)
} 

const drawMap = (lineData) => {
    let pathVar = d3.path();

    mapSvg.append("path")
        .attr("id", "map-path")

    for(let i=0; i<lineData.length; i++) {

        for(let j=0; j<lineData[i]?.length; j++) {
            if(j == 0)
                pathVar.moveTo((lineData[i][j].x) * PATH_WIDTH_ADDITION, +(adjustmentVar-lineData[i][j].y) * PATH_WIDTH_ADDITION)
            else
                pathVar.lineTo((lineData[i][j].x) * PATH_WIDTH_ADDITION, +(adjustmentVar-lineData[i][j].y) * PATH_WIDTH_ADDITION)
        } 

        if(i == lineData.length)
            pathVar.close();
    }

    mapSvg.select("#map-path")
        .attr("d", pathVar)
        .attr("stroke", "black")
        .style("stroke-width", 1)  
        .attr("fill", "white");
}


const drawPump = (pumpData) => {
    mapSvg.selectAll(".pump")
        .data(pumpData)
        .enter()
        .append("circle")
        .style("stroke", "red")
        .style("fill", "yellow")
        .attr("class", "pump")
        .attr("r", 5)
        .attr("cx", function (d) { return d.x * PATH_WIDTH_ADDITION })
        .attr("cy", function (d) { return +(adjustmentVar - d.y) * PATH_WIDTH_ADDITION });
}

const plotDeathByGender = (deathByGenderData) => {
    mapSvg.selectAll(".death")
        .data(deathByGenderData)
        .enter()
        .append("circle")
        .style("stroke", "black")
        .style("fill", function (d) {
            if (d.gender === '1') { return "orange" }
            else if(d.gender === '0') { return "darkblue" }
        })
        .attr("class", "death")
        .attr("r", 3)
        .attr("cx", function (d) { return d.x * PATH_WIDTH_ADDITION })
        .attr("cy", function (d) { return +(adjustmentVar - d.y) * PATH_WIDTH_ADDITION });
}

const filterMap = () => {
    let ageValue = ageSelect.options[ageSelect.selectedIndex].value;
    let genderValue = document.querySelector('input[name="gender"]:checked').value;

    mapSvg.selectAll('.death').remove();
    if(ageValue === "all" && genderValue === "all") {
        plotDeathByGender(deathByGenderDataFinal);
    }
    else {
        let filteredData = deathByGenderDataFinal.filter(d => {
            if(ageValue === "all" && parseInt(d.gender) === parseInt(genderValue)) {
                return d;
            }
            else if(genderValue === "all" && parseInt(d.age) === parseInt(ageValue)) {
                return d;
            }
            if(parseInt(d.gender) === parseInt(genderValue) && parseInt(d.age) === parseInt(ageValue)) {
                return d;
            }
        })

        mapSvg.selectAll(".death")
            .data(filteredData)
            .enter()
            .append("circle")
            .style("stroke", "black")
            .style("fill", function (d) {
                if(parseInt(d.gender) === parseInt('1')) { return "orange" }  
                else if (parseInt(d.gender) === parseInt('0')) { return "darkblue" }  
            })
            .attr("class", "death")
            .attr("r", 3)
            .attr("cx", function (d) { return d.x * PATH_WIDTH_ADDITION })
            .attr("cy", function (d) { return +(adjustmentVar - d.y) * PATH_WIDTH_ADDITION });
    }
}

// Functions for drawing deaths vs. days graph
const plotDeathsbyDays = (data) => {
    let height = 400;
    let width = 450;

    let maxDate = d3.max(data, function(d) { return d.date });
    let minDate = d3.min(data, function(d) { return d.date });
    let maxDeaths = d3.max(data, function(d) { return d.deaths });

    var y = d3.scaleLinear()
                .domain([0, maxDeaths])
                .range([height, 0]);

    var x = d3.scaleTime()
                .domain([minDate, maxDate])
                .range([0, width])

    var yAxis = d3.axisLeft(y)
    var xAxis = d3.axisBottom(x)

    let lineChartGroup = lineChart.append('g')
                                    .attr('transform', 'translate('+(margin.left+30)+', '+(margin.top+50)+')');

    let line = d3.line()
                    .x(function(d) { return x(d.date); })
                    .y(function(d) { return y(d.deaths); })

    lineChartGroup.append('path').attr('d', line(data)).attr('class', 'graph-path');

    lineChartGroup.append('g').attr('class', 'x axis').call(xAxis).attr("transform", 'translate(0,'+height+')')
    lineChartGroup.append('g').attr('class', 'y axis').call(yAxis)

    lineChartGroup.selectAll("line-circle")
        .data(data)
        .enter().append("circle")
        .attr("class", "data-circle")
        .attr("r", 5)
        .attr("cx", function(d) { return x(d.date); })
        .attr("cy", function(d) { return y(d.deaths); })
        .on("mouseover", function(d) {
            highlightDeathsByDate(d.target.__data__.date);
            let sel = d3.select(this);
            sel.style("fill", "red");

            deathsLabel.innerHTML = "" + getFormattedDate(d.target.__data__.date) + ", " + d.target.__data__.deaths + " deaths"
        })
        .on("mouseout", function(d) {
            let sel = d3.select(this);
            sel.style("fill", "black");

            deathsLabel.innerHTML = ""
            returnDotsColor();
        })

        lineChartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Deaths");  

        lineChartGroup.append("text")             
        .attr("transform",
              "translate(" + (width/2) + " ," + 
                             (height + margin.top + 20) + ")")
        .style("text-anchor", "end")
        .text("Dates");
}

const highlightDeathsByDate = (deathDate) => {
    mapSvg.selectAll(".death")
        .style("fill", function(d) { 
            if(getDateString(d.date) === getDateString(deathDate)) {
                var sel = d3.select(this);
                sel.raise();
                return "red"
            }
            else {
                if (d.gender === '1') { return "orange" }
                else if(d.gender === '0') { return "darkblue" }
            }
        })
}

const returnDotsColor = () => {
    mapSvg.selectAll(".death")
        .style("fill", function (d) {
            if (d.gender === '1') { return "orange" }
            else if(d.gender === '0') { return "darkblue" }
        })
        .attr("r", 3)
}

// Functions for drawing deaths by sex and deaths by age data
const plotDeathDistributionBySex = (data) => {
    var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(data.map(function(d) { return d.gender; }))
    .padding(0.2);

    barSvg1.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 350])
        .range([ height, 0]);

    barSvg1.append("g")
        .call(d3.axisLeft(y));

    // Bars
    barSvg1.selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.gender); })
        .attr("y", function(d) { return y(d.deaths); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.deaths); })
        .attr("fill", "#aadae9")

    barSvg1.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Deaths");  

    barSvg1.append("text")             
        .attr("transform",
              "translate(" + (width/2) + " ," + 
                             (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Gender");
}

const plotDeathDistributionByAge = (data) => {
    var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(data.map(function(d) { return d.ageGroup; }))
        .padding(0.2);

    barSvg2.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 180])
        .range([ height, 0]);
    
    barSvg2.append("g")
        .call(d3.axisLeft(y));

    // Bars
    barSvg2.selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
            .attr("x", function(d) { return x(d.ageGroup); })
            .attr("y", function(d) { return y(d.deaths); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(d.deaths); })
            .attr("fill", "#aadae9")

    barSvg2.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Deaths");  

    barSvg2.append("text")             
            .attr("transform",
                  "translate(" + (width/2) + " ," + 
                                 (height + margin.top + 20) + ")")
            .style("text-anchor", "middle")
            .text("Age Group");
}

// Code for zooming in the map
let zoomVar = d3.zoom()
    .extent([[0, 0], [600, 600]])
    .scaleExtent([1, 4])
    .on("zoom", zoomed);

mapSvg.call(zoomVar)

function zoomed({transform}) {
    mapSvg.attr("transform", transform);
}

function resetZoom() {
    mapSvg.call(zoomVar.transform, d3.zoomIdentity)
}