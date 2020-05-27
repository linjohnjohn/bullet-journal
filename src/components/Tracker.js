import React from 'react';
import './Tracker.css';
import { IoIosCheckmarkCircleOutline, IoIosCheckmarkCircle, IoIosCloseCircleOutline, IoIosCloseCircle } from 'react-icons/io';

const Tracker = ({ tracker: { type, name, value }, handleChange }) => {
    switch (type) {
        case 'Number':
            return <div className='tracker-container'>
                <div className='tracker-name'>{name}</div>
                <input type="range" value={value !== null ? value : ''} min='0' max='10' onChange={(e) => {
                    handleChange(parseInt(e.target.value, 10));
                }} />
            </div>
        case 'Binary':
            let Checkmark = IoIosCheckmarkCircleOutline;
            let Xmark = IoIosCloseCircleOutline;
            if (value === true) {
                Checkmark = IoIosCheckmarkCircle;
            }
            if (value === false) {
                Xmark = IoIosCloseCircle;
            }

            return <div className='tracker-container'>
                <div className='tracker-name'>{name}</div>
                <Checkmark className='icon' onClick={() => {
                    handleChange(true)
                }} />
                <Xmark className='icon' onClick={() => {
                    handleChange(false)
                }} />
            </div>
        default:
            return <></>
    }
}

export default Tracker;