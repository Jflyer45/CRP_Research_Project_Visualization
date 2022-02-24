let url2 = "https://crp-research-mankato.herokuapp.com/getYearlyTotals"
let req = new XMLHttpRequest()

let crpdata = {}

let xScale
let yScale

let xAxis
let yAxis

let width = 800
let height = 500
let padding = 40

let svg = d3.select('svg')
let tooltip = d3.select('#tooltip')

function removeLoader(){
    const child = document.getElementById('loader');
    child.remove()
}

let generateScales = () => {
    let years = []
    let keys = Object.keys(crpdata)
    keys.forEach(element => {
        years.push(Number(element));
    });
    let subs = []
    keys.forEach(element => {
        subs.push(crpdata[element]["commoditySubsidies"]);
    });

    xScale = d3.scaleLinear()
                        .domain([d3.min(years) - 1, d3.max(years) + 1])
                        .range([padding, width-padding])

    yScale = d3.scaleLinear()
                        .domain([d3.max(subs) / 1_000_000, 0])
                        .range([padding, height-padding])

}

let drawCanvas = () => {
    svg.attr('width', width)
    svg.attr('height', height)
}

let drawPoints = () => {
    let years = Object.keys(crpdata)
    let convertedData = []

    years.forEach(year => {
        let data = {"year": year,
         "conservationSubsidies": crpdata[year]["conservationSubsidies"],
         "disasterSubsidies": crpdata[year]["disasterSubsidies"],
         "commoditySubsidies": crpdata[year]["commoditySubsidies"]}
        convertedData.push(data)
    });

    svg.selectAll('circle')
            .data(convertedData)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('r', '6')
            .attr('data-xvalue', (item) => {
                console.log(item)
                return item["year"]
            })
            .attr('data-yvalue', (item) => {
                return item["commoditySubsidies"]
            })
            .attr('fill', (item) => {
                return 'lightgreen'
            })
            .attr('cx', (item) => {
              return xScale(item['year'])
            })         
            .attr('cy', (item) => {

                return yScale(item["commoditySubsidies"] / 1_000_000)
            })
            .on('mouseover', (item) => {
                tooltip.transition()
                    .style('visibility', 'visible')
                
                tooltip.text(item['year'] + ' - $' + item['commoditySubsidies'])
                tooltip.attr('data-year', item['Year'])
            })
            .on('mouseout', (item) => {
                tooltip.transition()
                    .style('visibility', 'hidden')
            })
}

let generateAxes = () => {

    xAxis = d3.axisBottom(xScale)
                .tickFormat(d3.format('d'))  

    yAxis = d3.axisLeft(yScale)
                .tickFormat(d3.format('d'))
    svg.append('g')
        .call(xAxis)
        .attr('id', 'x-axis')
        .attr('transform', 'translate(0, ' + (height-padding) +')')

    svg.append('g')
        .call(yAxis)
        .attr('id', 'y-axis')
        .attr('transform','translate(' + padding + ', 0)')
}

async function getCRPData(){
    let returnData
    await fetch(url2, {method: "GET"})
    .then(res => res.json())
    .then(data => returnData = data);
    crpdata = await returnData;
}

async function createGraph(){
    let crpPromise = getCRPData()
    await crpPromise;
    console.log(crpdata)
    removeLoader()
    drawCanvas()
    generateScales()
    generateAxes()
    drawPoints()
}

createGraph()

// req.open('GET', url, true)
// req.onload = () => {
//     values = JSON.parse(req.responseText)
//     console.log(values)
//     drawCanvas()
//     generateScales()
//     drawPoints()
//     generateAxes()
// }
// req.send()