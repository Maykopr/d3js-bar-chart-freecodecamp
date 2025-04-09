const margin = { top: 40, left: 40, right: 40, bottom: 40 };
let outWidth = parseInt(d3.select("#canvas").style("width"));
let outHeight = parseInt(d3.select("#canvas").style("height"));
const inWidth = outWidth - margin.left - margin.right;
const inHeight = outHeight - margin.top - margin.bottom;

function drawChartResponsive(data) {
	const years = data.data.map((item) => item[0].substring(0, 4));
	const yearsDate = data.data.map((item) => new Date(item[0]));
	const GDP = data.data.map((item) => item[1]);

	//defininção do container
	const canvas = d3.select("#canvas");
	const container = canvas
		.append("svg")
		.attr("class", "svg-container")
		.attr("width", outWidth)
		.attr("height", outHeight);

	container
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", -300)
		.attr("y", 80)
		.text("Gross Domestic Product");

	// definição dos eixos e escalas
	const yLinearScale = d3
		.scaleLinear()
		.domain([0, d3.max(GDP)])
		.range([0, inHeight]);

	const scaledGDP = GDP.map((item) => yLinearScale(item));

	const xScale = d3
		.scaleTime()
		.domain([d3.min(yearsDate), d3.max(yearsDate)])
		.range([0, inWidth]);

	const xAxis = d3.axisBottom(xScale);

	const yAxisScale = d3
		.scaleLinear()
		.domain([0, d3.max(GDP)])
		.rangeRound([inHeight, 0]);

	const yAxis = d3.axisLeft(yAxisScale);

	const tooltip = canvas.append("div").attr("id", "tooltip").style("opacity", 0);

	const overlay = canvas.append("div").attr("class", "overlay").style("opacity", 0);

	// montando o chart
	container
		.append("g")
		.call(xAxis)
		.attr("id", "x-axis")
		.attr("transform", `translate(${margin.left}, ${outHeight - margin.bottom})`);

	container
		.append("g")
		.call(yAxis)
		.attr("id", "y-axis")
		.attr("transform", `translate(${margin.left}, ${margin.top})`);

	const svg = d3
		.select("svg")
		.append("g")
		.attr("class", "bars")
		.selectAll("rect")
		.data(scaledGDP)
		.enter()
		.append("rect");

	const barWidth = xScale(new Date(d3.max(years))) / years.length;
	svg.attr("width", barWidth)
		.attr("height", (d) => d)
		.attr("x", (d, i) => xScale(yearsDate[i]))
		.attr("y", (d) => outHeight - margin.bottom - d)
		.attr("class", "bar")
		.attr("data-date", (d, i) => data.data[i][0])
		.attr("data-gdp", (d, i) => data.data[i][1])
		.attr("index", (d, i) => i)
		.attr("transform", `translate(${margin.left}, 0)`)
		.on("mouseover", function (event, d) {
			const i = this.getAttribute("index");

			overlay
				.transition()
				.duration(0)
				.style("opacity", 0.9)
				.style("height", d + "px")
				.style("width", barWidth + "px")
				.style("left", xScale(yearsDate[i]) + "px")
				.style("top", outHeight - margin.bottom - d + "px")
				.style("transform", `translateX(${margin.left}px)`);
			tooltip.transition().duration(0).style("opacity", 0.9);
			tooltip
				.text(
					`${years[i]}
                    $${GDP[i].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, "$1,")}
                    Billion
                    `
				)
				.attr("data-date", data.data[i][0])
				.style("left", barWidth * i + "px")
				.style("top", outHeight / 2 + "px")
				.style("transform", `translateX(80px)`)
				.style("opacity", "0.9");
		})
		.on("mouseout", function () {
			tooltip.transition().duration(500).style("opacity", 0);
			overlay.transition().duration(500).style("opacity", 0);
		});

	function changeWidthResponsive() {
		outWidth = parseInt(d3.select(".container").style("width"), 10);
		const inWidth = outWidth - margin.left - margin.right;
		d3.select(".svg-container").attr("width", inWidth).attr("height", outHeight);

		xScale.range([0, inWidth]);
		yAxisScale.rangeRound([inHeight, 0]);
		const xAxis = d3.axisBottom(xScale);

		d3.select("#x-axis")
			.attr("transform", `translate(0,${outHeight - margin.bottom})`)
			.call(xAxis)
			.selectAll("text")
			.attr("dx", "-1.0em")
			.attr("dy", ".15em");

		d3.selectAll(".bar")
			.attr("width", barWidth)
			.attr("height", (d) => d)
			.attr("x", (d, i) => xScale(yearsDate[i]))
			.attr("y", (d) => outHeight - margin.bottom - d);
	}

	window.addEventListener("resize", changeWidthResponsive);
}

async function main() {
	const data = await d3.json(
		"https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json"
	);
	drawChartResponsive(data);
}

main();
