import { BarChartProps } from "@/src/types/components/projects/projectId/project-overview/project-overview";
import style from "@/src/styles/components/projects/projectId/project-overview.module.css";
import { useEffect } from "react";
import * as d3 from 'd3v4';

export default function InterAnnotatorBarChart(props: BarChartProps) {

    useEffect(() => {
        if (!props.dataInput) return;

        const colorScale = d3.scaleLinear()
            .domain([0, 0.5, 1])
            .range(["#fca5a5", '#fde047', "#86efac"]);

        const users = props.dataInput.allUsers.map((u) => {
            let avatarUri, svgField, name
            if (u.name == "Gold Star") {
                svgField = `<svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-star inline-block" width="32" height="32" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#2c3e50" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
              </svg>`
                name = svgField
            } else {
                let avatarSelector;
                if (u.name == "Unknown") {
                    let s = 0;
                    for (let i = 0; i < 5; i++)s += u.user.id.charCodeAt(i);
                    avatarSelector = s % 5;
                } else {
                    avatarSelector = (u.name.charCodeAt(0) + u.name.charCodeAt(3)) % 5
                }
                avatarUri = "/refinery/avatars/" + avatarSelector + ".png"
                name = u.name
            }

            return { id: u.user.id, name: name, image: avatarUri, svg: svgField }
        });
        const userLookup = {}
        users.forEach((u) => userLookup[u.id] = u);

        // set the dimensions and margins of the graph
        var svg = d3.select("#annotator-matrix"),
            margin = { top: 40, right: 20, bottom: 60, left: 60 },
            width = +(window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) * 0.77 + margin.left + margin.right,
            height = 450 - margin.top - margin.bottom;

        svg.selectAll("*").remove();

        // append the svg object to the body of the page
        var svg = svg
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Labels of row and columns
        var myGroups = users.map(u => u.id)
        var myVars = users.map(u => u.id)

        // Build x scales and axis:
        var x = d3.scaleBand()
            .range([0, width])
            .domain(myGroups)
            .padding(0.05)

        let xAxis = d3.axisBottom(x).tickFormat(function (d) { return ''; })
        var tw = 32;
        var th = 32;
        var tx = -(tw / 2);
        var ty = 10;

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .style("font-size", 14)
            .style('font-family', '"DM Sans", sans-serif')
            .call(xAxis)//d3.axisBottom(x).tickFormat(u => userLookup[u].name));
            .selectAll("g")
            .append("svg:foreignObject")
            .attr("width", tw)
            .attr("height", th)
            .attr("x", tx)
            .attr("y", ty)
            .append("xhtml:div")
            .html(function (u) {
                let user = userLookup[u]
                if (user.image) {
                    return "<img src='" + user.image + "'>";
                } else {
                    return user.svg;
                }
            });

        // Build y scales and axis:
        var y = d3.scaleBand()
            .range([height, 0])
            .domain(myVars.reverse())
            .padding(0.1);

        let yAxis = d3.axisLeft(y).tickFormat(function (d) { return ''; })
        var tx = -(tw + 10);
        var ty = -(th / 2);

        svg.append("g")
            .style("font-size", 14)
            .style('font-family', '"DM Sans", sans-serif')
            .call(yAxis)
            .selectAll("g")
            .append("svg:foreignObject")
            .attr("width", tw)
            .attr("height", th)
            .attr("x", tx)
            .attr("y", ty)
            .append("xhtml:div")
            .html(function (u) {
                let user = userLookup[u]
                if (user.image) {
                    return "<img src='" + user.image + "'>";
                } else {
                    return user.svg;
                }
            });

        // create a tooltip
        var divTooltip = d3.select("div.annotatorMatrixTooltip")

        var mouseover = function (d) {
            var elements = document.querySelectorAll(":hover.my-selector");
            if (elements.length > 0) {
                divTooltip.style("opacity", 1);
            }
        }
        var mousemove = function (d) {
            var elements = document.querySelectorAll(":hover.my-selector");
            if (elements.length > 0) {
                var l = elements.length - 1;
                //@ts-ignore
                var elementData = elements[l].__data__;
                if (elementData.userIdA != elementData.userIdB) {
                    divTooltip.style("left", d3.event.pageX + 10 + "px")
                    divTooltip.style("top", d3.event.pageY - 25 + "px")
                    divTooltip.style("display", "inline-block")
                    divTooltip.style("opacity", "0.9");
                    divTooltip.html('<span style="font-family: \'DM Sans\', sans-serif;">' + userLookup[elementData.userIdA].name + " / " + userLookup[elementData.userIdB].name + "</span>");
                }
            }
        }
        var mouseleave = function (d) {
            divTooltip.style("opacity", 0)
        }

        // add the squares
        svg.selectAll()
            .data(props.dataInput.elements, e => e.userIdA + ':' + e.userIdB)
            .enter()
            .append("rect")
            .classed("my-selector", true)
            .attr("x", function (e) { return x(userLookup[e.userIdA].id) })
            .attr("y", function (e) { return y(userLookup[e.userIdB].id) })
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", function (d) {
                if (d.userIdA == d.userIdB) return 'white';
                else if (d.percent == -1) return "#f9fafb";
                else return colorScale(d.percent);
            })

        svg
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)

        svg.selectAll()
            .data(props.dataInput.elements, e => e.userIdA + ':' + e.userIdB)
            .enter()
            .append('text')
            .text((d) => {
                if (d.userIdA == d.userIdB) return "";
                if (d.percent == -1) return "n/a";
                return Math.round(d.percent * 10000) / 100 + " %"
            })
            .style('fill', 'black')
            .style("font-size", 14)
            .style('font-family', '"DM Sans", sans-serif')
            .style('opacity', 0.8)
            .attr('x', function (d) {
                return x(d.userIdA) + 0.5 * x.bandwidth();
            })
            .attr('y', function (d) {
                return y(d.userIdB) + 0.5 * y.bandwidth()
            })
    }, [props.dataInput])

    return (<>
        <div className={`${style.annotatorMatrixTooltip} annotatorMatrixTooltip`}></div>
        <div id="annotator-matrix" className="container w-full"></div></>)
}