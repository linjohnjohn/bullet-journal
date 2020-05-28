import React from 'react';
import moment from 'moment';
import { IoIosArrowDropleftCircle, IoIosArrowDroprightCircle } from 'react-icons/io';

import MonthlyHeatMap from './MonthlyHeatMap';
import TrackerAPI from '../models/TrackerAPI';
import './VisualizationControl.css'
import YearlyHeatMap from './YearlyHeatMap';

export default class VisualizationControl extends React.Component {
    state = {
        data: {},
        date: new Date(),
        selectedTrackerName: null,
        selectedTimePeriod: 'Month',
        trackers: []
    }


    async componentDidMount() {
        const trackers = await TrackerAPI.getAllTrackers();
        this.setState({ trackers });
    }

    handleIncrementTimePeriod = (i) => {
        const { date, selectedTimePeriod } = this.state;
        let newDate = null;
        if ( selectedTimePeriod === 'Month') {
            newDate = new Date(date.getFullYear(), date.getMonth() + i);
        } else {
            newDate = new Date(date.getFullYear() + i, date.getMonth());
        }
        this.setState({ date: newDate });
    }

    handleChangeTrackerName = (name) => {
        const { trackers } = this.state;
        // @todo error handle for empty filter
        const data = trackers.filter(t => t.name === name)[0].values || {};
        this.setState({ selectedTrackerName: name, data })
    }

    handleChangeTimePeriod = (t) => {
        this.setState({ selectedTimePeriod: t });
    }

    render() {
        const { data, selectedTrackerName, selectedTimePeriod, date, trackers } = this.state;

        let trackerMetadata = null;
        if (selectedTrackerName) {
            const { type, min, max, name } = trackers.filter(t => t.name === selectedTrackerName)[0]
            trackerMetadata = { type, min, max, name }
        }

        let readableDate = moment(date).format('MMMM YYYY');

        if (selectedTimePeriod === 'Year') {
            readableDate = moment(date).format('YYYY');
        }

        return <>
            <div className="notebook-header">
                <IoIosArrowDropleftCircle
                    className='icon'
                    onClick={() => this.handleIncrementTimePeriod(-1)} />
                <span>{readableDate}</span>
                <IoIosArrowDroprightCircle
                    className='icon'
                    onClick={() => this.handleIncrementTimePeriod(1)} />
            </div>
            <div className="notebook-body">
                <div className="viz-panel-control">
                    <p>Your Trackers</p>
                    <div className="centered-button-row">
                        {trackers.map((t, i) => {
                            const classes = `btn ${t.name === selectedTrackerName ? 'selected' : ''}`
                            return <button className={classes} key={i} onClick={() => this.handleChangeTrackerName(t.name)}>{t.name}</button>
                        })}
                    </div>

                    <p>Time Period</p>
                    <div className="centered-button-row">
                        <button
                            className={`btn ${selectedTimePeriod === 'Month' ? 'selected' : ''}`}
                            onClick={() => this.handleChangeTimePeriod('Month')}>
                            Month
                        </button>
                        <button
                            className={`btn ${selectedTimePeriod === 'Year' ? 'selected' : ''}`}
                            onClick={() => this.handleChangeTimePeriod('Year')}>
                            Year
                        </button>
                    </div>
                </div>
                <div className="viz-calendar">
                    {selectedTrackerName ?
                        selectedTimePeriod === 'Month' ? 
                            <MonthlyHeatMap data={data} date={date} trackerMetadata={trackerMetadata} /> :
                            <YearlyHeatMap data={data} date={date} trackerMetadata={trackerMetadata}></YearlyHeatMap> :
                        <div className='centered-message'>
                            <p>Select a Tracker</p>
                        </div>
                    }
                </div>
            </div>
        </>
    }
}

