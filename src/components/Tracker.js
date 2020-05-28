import React, { useEffect, useRef } from 'react';
import './Tracker.css';
import { IoIosCheckmarkCircleOutline, IoIosCheckmarkCircle, IoIosCloseCircleOutline, IoIosCloseCircle } from 'react-icons/io';

function setBubble(rangeEl, bubbleEl) {
    const { value, min, max } = rangeEl;
    if (value === null || value === undefined || bubbleEl === null) {
        return;
    }
    const percent = Number(((value - min) * 100) / (max - min));
    bubbleEl.textContent = value;
    bubbleEl.style.left = `calc(${percent}% + (${8 - percent * 0.15}px))`;
}

const Tracker = ({ tracker: { type, name, value, min, max }, handleChange }) => {
    let bubble = useRef(null);

    useEffect(() => {
        setBubble({ value, min, max }, bubble.current);
    });

    switch (type) {
        case 'Number':
            const handleNumberInputChange = (e) => {
                setBubble(e.target, bubble.current);
                handleChange(parseInt(e.target.value, 10));
            }

            return <div className='tracker-container'>
                <div className='tracker-name'>{name}: {value !== null ? value : ''}</div>
                <div className="range-wrap">
                    <input type="range" value={value !== null ? value : ''} min={min} max={max} onChange={handleNumberInputChange} />
                    <output ref={bubble} className='tracker-bubble'>N/A</output>
                </div>
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