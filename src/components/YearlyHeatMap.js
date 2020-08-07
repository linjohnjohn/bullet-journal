import React from 'react';
import { withRouter } from 'react-router-dom';
import * as d3 from "d3";
import moment from 'moment';

import './MonthlyHeatMap.css';

class YearlyHeatMap extends React.Component {
    componentDidMount() {
        this.drawYearCalendar();
    }

    componentDidUpdate() {
        this.drawYearCalendar();
    }

    drawYearCalendar() {
        d3.select('#heat-map').selectAll('.month-in-year').remove();
        const { date, data, trackerMetadata } = this.props;
        const { type, min, max, name } = trackerMetadata;
        const year = date.getFullYear();
        const cellSize = 100;
        const dayf = d3.utcFormat("%w"), // day of the week
            day_of_month = d3.utcFormat("%e"), // day of the month
            week = d3.utcFormat("%U"), // week number of the year
            monthf = d3.utcFormat("%m"), // month number
            yearf = d3.utcFormat("%Y");

        const datesByMonth = []
        for (let i = 0; i < 12; i++) {
            const d = d3.utcDays(new Date(Date.UTC(year, i, 1)), new Date(Date.UTC(year, i + 1, 1)));
            datesByMonth.push(d);
        }

        const tooltip = d3.select('#heat-map')
            .append('div').attr('id', 'tooltip')
            .style('position', 'absolute')
            .style('z-index', '10');

        const monthContainers = d3.select('#heat-map').selectAll('.month-in-year').data(datesByMonth)
            .enter()
            .append('div')
            .attr('class', 'month-in-year');

        monthContainers.append('div').attr('class', 'month-text').text((d, i) => {
            return moment().month(i).format("MMMM");
        });

        const months = monthContainers.append('svg').attr('viewBox', '0 0 700 600').attr('preserveAspectRatio', 'none')

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
        const dayGroup = months.selectAll('.day').data(d => d).enter().append('g')
            .attr('class', 'day')
            .attr('transform', d => {
                const weekOfMonth = week(d) - week(new Date(Date.UTC(yearf(d), monthf(d) - 1, 1)));
                return `translate(${cellSize * dayf(d)}, ${weekOfMonth * cellSize})`
            });

        dayGroup
            .on('click', handleDateClick)
            .on('mouseover', handleDateMouseover)
            .on('mouseout', handleDateMouseout);


        dayGroup.append('rect')
            .attr('width', cellSize)
            .attr('height', cellSize)
            .on('click', (d) => {
                this.props.history.push({
                    pathname: '/',
                    state: {
                        date: new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
                    }
                })
            });

        dayGroup.append('text').text(d => day_of_month(d))
            .attr('x', cellSize / 2)
            .attr('y', cellSize / 2)

        const filteredRect = d3.selectAll('rect').filter(d => {
            return data[d.getTime()]
        }).attr('class', 'colored');

        const style = getComputedStyle(document.body);
        const grey = style.getPropertyValue('--calendar-dull-box');
        const color = style.getPropertyValue('--hover');
        const colorGradient = d3.scaleLinear().range([grey, color]).domain([min, max]);

        if (type === 'Number') {
            filteredRect.style('fill', (d) => {
                return colorGradient(data[d.getTime()]);
            });
        } else {
            filteredRect.style('fill', (d) => {
                return color;
            });
        }
    }

    render() {
        return <div id='heat-map'>
        </div>
    }
}

export default withRouter(YearlyHeatMap)