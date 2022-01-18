import React, { useState, useEffect } from "react";
import "./App.css";
import * as d3 from "https://cdn.skypack.dev/d3@7";

function MyGraph({ data }) {
    const svgRef = React.useRef(null);
    const margin = { top: 20, right: 20, bottom: 30, left: 40 },
        width = 1160 - margin.left - margin.right,
        height = 650 - margin.top - margin.bottom;

    useEffect(() => {
        if (data.length === 0) return;
        let svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear svg content before adding new elements

        const groups = data.dates.sort();
        const subgroups = data.zones;
        const myData = data.data;
        const max = data.max;
        const colors = d3.schemeTableau10;

        //X axis
        const x0 = d3
            .scaleBand()
            .domain(groups)
            .range([0, width])
            .padding([0.2]);

        //X axis for groupes
        const x1 = d3.scaleBand().domain(subgroups).range([0, x0.bandwidth()]);

        //Y axis
        const y = d3.scaleLinear().domain([0, max]).range([height, 0]);

        //fine colors ;)
        const color = d3
            .scaleOrdinal()
            .domain(subgroups)
            .range(["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#073b4c"]);

        //add svg caracteristics
        svg = d3
            .select(svgRef.current)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr(
                "transform",
                "translate(" + margin.left + "," + margin.top + ")"
            );

        //ajout de l'axe x0
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x0).tickSize(0));

        //ajout de l'axe y
        svg.append("g").call(d3.axisLeft(y));

        //aled

        svg.append("g")
            .selectAll("g")
            // Enter in data = loop group per group
            .data(myData)
            .join("g")
            .attr("transform", (d) => `translate(${x0(d.date)}, 0)`)
            .selectAll("rect")
            //.data(function(d) { return subgroups.map(function(key) { return {key: key, value: d[key]}; }); })
            //console.log()
            .data((d) => {
                console.log(d);
                return d.valeurs;
            })
            .join("rect")
            .attr("x", (d) => x1(d.zone))
            .attr("y", (d) => y(0))
            .attr("width", x1.bandwidth())
            .attr("height", (d) => height - y(0))
            .attr("fill", (d) => color(d.zone))
            .on("mouseover", function (d) {
                d3.select(this).style("fill", d3.rgb(color(d.rate)).darker(2));
            })
            .on("mouseout", function (d) {
                d3.select(this).style("fill", color(d.rate));
            });

        //petite animation trop kawai
        svg.selectAll("rect")
            .transition()
            .delay((d) => Math.random() * 1000)
            .duration(1000)
            .attr("y", (d) => y(d.nombre))
            .attr("height", (d) => height - y(d.nombre));

        var legend = svg.selectAll(".legend")
            .data(subgroups)
            .join("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => ("translate(0," + i * 20 + ")"))
            .style("opacity", "0");

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function (d) { return color(d); });

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text((d) => d);

        legend.transition().duration(500).delay(function (d, i) { return 1300 + 100 * i; }).style("opacity", "1");



        //console.log(data);
    }, [data]);

    return (
        <div className="svgContainer">
            <svg ref={svgRef} width={1160} height={650} />
        </div>
    );
}

export default MyGraph;
