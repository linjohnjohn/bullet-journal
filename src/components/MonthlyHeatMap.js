import React from 'react';
import * as d3 from "d3";

import './MonthlyHeatMap.css';

export default class MonthlyHeatMap extends React.Component {
    componentDidMount() {
        this.draw();
    }

    componentDidUpdate() {
        this.draw();
    }

    draw() {
        d3.select('#monthly-heat-map').select('svg').remove();
        const { date, data, trackerMetadata } = this.props;
        const { type, min, max } = trackerMetadata;
        const month = date.getMonth(), year = date.getFullYear();
        const width = 1000, height = 1000, cellSize = 100;
        const dayf = d3.utcFormat("%w"), // day of the week
            day_of_month = d3.utcFormat("%e"), // day of the month
            day_of_year = d3.utcFormat("%j"),
            week = d3.utcFormat("%U"), // week number of the year
            monthf = d3.utcFormat("%m"), // month number
            yearf = d3.utcFormat("%Y"),
            percent = d3.format(".1%"),
            format = d3.utcFormat("%Y-%m-%d");

        const svg = d3.select('#monthly-heat-map').append('svg').attr('viewBox', '0 0 700 600').attr('preserveAspectRatio', 'none')
        const dayGroup = svg.selectAll('.day').data((d) => {
            return d3.utcDays(new Date(Date.UTC(year, month, 1)), new Date(Date.UTC(year, month + 1, 1)));
        }).enter().append('g')
            .attr('class', 'day')
            .attr('transform', d => {
                const weekOfMonth = week(d) - week(new Date(Date.UTC(yearf(d), monthf(d) - 1, 1)));
                return `translate(${cellSize * dayf(d)}, ${weekOfMonth * cellSize})`
            });

        dayGroup.append('rect')
            .attr('width', cellSize)
            .attr('height', cellSize);

        dayGroup.append('text').text(d => day_of_month(d))
            .attr('x', cellSize / 2)
            .attr('y', cellSize / 2)

        const filteredRect = d3.selectAll('rect').filter(d => {
            return data[d.getTime()]
        })
        .attr('class', 'colored');

        if (type === 'Number') {
            filteredRect.style('fill-opacity', (d) => {
                const opacity = 100 * (data[d.getTime()] - min) / (max - min);
                return `${opacity}%`
            });
        }
    }

    render() {
        return <div id='monthly-heat-map'>
        </div>
    }
}