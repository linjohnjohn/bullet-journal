import React from 'react';
import * as d3 from "d3";

import './D3Visualization.css';


export default class Month extends React.Component {
    state = {
        data: [
            { x: 0, y: 1 },
            { x: 1, y: 0 },
            { x: 2, y: 1 },
            { x: 3, y: 0 },
            { x: 4, y: 1 },
            { x: 5, y: 0 },
            { x: 6, y: 1 },
            { x: 7, y: 0 },
            { x: 8, y: 1 },
            { x: 9, y: 0 },
            { x: 10, y: 1 },
        ]
    }

    async componentDidMount() {
        this.draw();
    }

    draw() {
        const margin = 50,
            width = 960,
            height = 400;

        const svg = d3.select(this.d3).append("svg")
            // .attr("width", width)
            // .attr("height", height)
            .attr("viewBox", "0 0 " + width + " " + height)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g");
        // .attr("transform", "translate(" + margin + "," + margin + ")");

        const { data } = this.state;
        const x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.x))
            .range([margin, width - margin]);
        const y = d3.scaleLinear()
            .domain(d3.extent(data, d => d.y))
            .range([height - margin, margin]);

        const line = d3.line()
            .x(d => x(d.x))
            .y(d => y(d.y))
            .curve(d3.curveStepBefore);

        const xAxis = g => g
            .attr("class", "x axis")
            .attr("transform", `translate(0,${height - margin})`)
            .call(d3.axisBottom(x))

        const yAxis = g => g
            .attr("class", "y axis")
            .attr("transform", `translate(${margin},0)`)
            .call(d3.axisLeft(y));

        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);

        svg.append("g")
            .call(xAxis)

        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height)
            .text("X Axis");

        svg.append("g")
            .call(yAxis);

        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", `rotate(-90 ${margin / 4} ${height / 2})`)
            .attr("x", margin / 2)
            .attr("y", height / 2)
            .text("Y Axis");
    }

    render() {
        return <>
            <div id='d3-root' ref={d3 => this.d3 = d3}>
            </div>
        </>
    }
}

