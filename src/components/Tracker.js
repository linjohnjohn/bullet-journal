import React from 'react';
import './Tracker.css';
import { IoIosCheckmarkCircleOutline, IoIosCloseCircleOutline } from 'react-icons/io';

const Tracker = ({ tracker: { type, name, value }}) => {
    switch (type) {
        case 'Binary':
            return <div className='tracker-container'>
                <div className='tracker-name'>{name}</div>
                <input type="range" />
            </div>
        case 'Number':
            return <div className='tracker-container'>
                <div className='tracker-name'>{name}</div>
                <IoIosCheckmarkCircleOutline className='icon' />
                <IoIosCloseCircleOutline className='icon' />
            </div>
        default:
            return <></>
    }
}

export default Tracker;