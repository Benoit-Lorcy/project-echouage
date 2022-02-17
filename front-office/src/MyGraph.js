import React, { useEffect } from "react";
import "./App.css";
import * as d3 from "d3";

//
function MyGraph({ data }) {
    //initialisation du container
    const svgContainerRef = React.useRef(null);

    //reset la popup pour ne pas avoir de doublons
    d3.selectAll(".tooltip").remove();

    //initilalise la popup qui permet de voir le nombre éxacte quand on passe sur une barres
    var tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    //
    let margin = { top: 20, right: 20, bottom: 30, left: 40 };
    let width = 1160 - margin.left - margin.right;
    let height = 650 - margin.top - margin.bottom;

    //update du graph
    useEffect(() => {
        //s'il n'y a pas de data, on ne fait rien
        if (data.length === 0) return;

        //nétoyage du svg
        d3.select(svgContainerRef.current).selectAll("svg").remove();

        //définition de la taille du graphique

        //constates de data
        const groups = data.dates.sort();
        const subgroups = data.zones;
        const myData = data.data;
        const max = data.max;

        //X axis
        const x0 = d3
            .scaleBand()
            .domain(groups)
            .range([0, width])
            .padding([0.2]);

        //X axis for groupes
        const x1 = d3.scaleBand().domain(subgroups).range([0, x0.bandwidth()]);

        //Y axis
        const y = d3.scaleLinear().domain([0, max]).range([height, 40]);

        //fine colors ;)
        const color = d3
            .scaleOrdinal()
            .domain(subgroups)
            .range(["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#073b4c"]);

        //add svg caracteristics
        const svg = d3
            .select(svgContainerRef.current)
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

        //création des barres
        svg.append("g")
            .selectAll("g")
            // Enter in data = loop group per group
            .data(myData)
            .join("g")
            .attr("transform", (d) => `translate(${x0(d.date)}, 0)`)
            .selectAll("rect")
            .data((d) => d.valeurs)
            .join("rect")
            .attr("x", (d) => x1(d.zone))
            .attr("y", (d) => y(0))
            .attr("width", x1.bandwidth())
            .attr("height", (d) => height - y(0))
            .attr("fill", (d) => color(d.zone))
            .on("mouseover", function (d, i) {
                //console.log(d)
                tooltip.transition().duration(50).style("opacity", 1);
                tooltip
                    .html(i.nombre + " ")
                    .style("left", d.pageX + "px")
                    .style("top", d.pageY - 28 + "px");
            })
            .on("mouseout", function (d) {
                tooltip.transition().duration(200).style("opacity", 0);
            });

        //animation des barres qui popent du bas
        svg.selectAll("rect")
            .transition()
            .delay((d) => Math.random() * 1000)
            .duration(1000)
            .attr("y", (d) => y(d.nombre))
            .attr("height", (d) => height - y(d.nombre));

        let shift = 0;

        //création des éléments de la légende
        const legend = svg
            .selectAll(".legend")
            .data(subgroups)
            .join("g")
            .attr("class", "legend")
            .style("opacity", "0");

        legend
            .append("rect")
            .attr("x", 0)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", (d) => color(d));

        legend
            .append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text((d) => d);

        //réorganisation de la légend
        svg.selectAll(".legend")
            .attr("transform", (d, i, e) => {
                let sent = shift;
                shift += e[i].getBoundingClientRect().width + 15;
                return "translate(" + sent + ",0)";
            })
            .attr("transform", (d, i, e) => {
                let x = d3
                    .select(e[i])
                    .attr("transform")
                    .match(/([0-9]*\.?[0-9]*),([0-9]*\.?[0-9]*)/)[1];
                return "translate(" + (Number(x) + (width - shift) / 2) + ",0)";
            });

        // animations de la légende
        legend
            .transition()
            .duration(500)
            .delay((d, i) => 1300 + 100 * i)
            .style("opacity", "1");
    }, [data, tooltip, width, height]); // eslint-disable-line react-hooks/exhaustive-deps

    //affichage du titre et du graphique
    return (
        <div className="svgContainer" ref={svgContainerRef}>
            <h1 className="graphTitle">{`Echouages de ${
                data.espece
            } de ${Math.min(...data.dates)} à ${Math.max(...data.dates)}`}</h1>
        </div>
    );
}

export default MyGraph;
