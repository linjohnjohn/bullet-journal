import React from 'react';
import * as d3 from "d3";
import { withRouter } from 'react-router-dom';

import './MonthlyHeatMap.css';

class MonthlyHeatMap extends React.Component {
    componentDidMount() {
        this.draw();
    }

    componentDidUpdate() {
        this.draw();
    }

    draw = () => {
        d3.select('#monthly-heat-map').select('svg').remove();
        const { date, data, trackerMetadata } = this.props;
        const { type, min, max, name } = trackerMetadata;
        const month = date.getMonth(), year = date.getFullYear();
        const cellSize = 100;
        const dayf = d3.utcFormat("%w"), // day of the week
            day_of_month = d3.utcFormat("%e"), // day of the month
            week = d3.utcFormat("%U"), // week number of the year
            monthf = d3.utcFormat("%m"), // month number
            yearf = d3.utcFormat("%Y");

        const tooltip = d3.select('#monthly-heat-map')
            .append('div').attr('id', 'tooltip')
            .style('position', 'absolute')
            .style('z-index', '10');

        const svg = d3.select('#monthly-heat-map').append('svg').attr('viewBox', '0 0 700 600').attr('preserveAspectRatio', 'none')
        const dayGroup = svg.selectAll('.day').data((d) => {
            return d3.utcDays(new Date(Date.UTC(year, month, 1)), new Date(Date.UTC(year, month + 1, 1)));
        }).enter().append('g')
            .attr('class', 'day')
            .attr('transform', d => {
                const weekOfMonth = week(d) - week(new Date(Date.UTC(yearf(d), monthf(d) - 1, 1)));
                return `translate(${cellSize * dayf(d)}, ${weekOfMonth * cellSize})`
            });

        const handleDateClick = (d) => {
            this.props.history.push({
                pathname: '/',
                state: {
                    date: new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
                }
            });
        }

        const handleDateMouseover = (d) => {
            let value = data[d.getTime()];

            if (type === 'Binary') {
                if (value === true) {
                    value = 'Yes'
                } else if (value === false) {
                    value = 'No'
                }
            }

            if (value === undefined || value === null) {
                value = 'No Entry';
            }

            const text = `${name} : ${value}`;
            tooltip.transition()
                .duration(300)
                .style("opacity", .8);
            tooltip.text(text)
                .style("left", (d3.event.pageX) + 30 + "px")
                .style("top", (d3.event.pageY) + "px");
        }

        const handleDateMouseout = (d) => {
            tooltip.transition()
                .duration(300)
                .style("opacity", 0);
        }
        
        dayGroup
            .on('click', handleDateClick)
            .on('mouseover', handleDateMouseover)
            .on('mouseout', handleDateMouseout);
    
        dayGroup.append('rect')
            .attr('width', cellSize)
            .attr('height', cellSize)
        

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

export default withRouter(MonthlyHeatMap)