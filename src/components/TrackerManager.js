import React, { useState, useEffect } from "react";
import { IoMdSettings, IoIosAddCircle, IoIosCloseCircle, IoIosAddCircleOutline, IoIosCloseCircleOutline, IoMdSync } from 'react-icons/io';

import Tracker from './Tracker';
import Modal from './Modal';
import EditTracker from './EditTracker';
import './TrackerManager.css'

import Dnd from '../util/dnd';

let globalDnd = null;

const TrackerManager = ({
    trackers,
    handleAddTracker,
    handleDeleteTracker,
    handleChangeTrackerValue,
    handleSaveNewOrder
}) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isAddingTracker, setIsAddingTracker] = useState(false);
    const [isAddingLoading, setisAddingLoading] = useState(false);
    const [trackerOrder, setTrackerOrder] = useState([]);
    const [newTrackerDetails, setNewTrackerDetails] = useState({
        name: '',
        type: null,
    });

    useEffect(() => {
        if (!globalDnd) {
            const parent = document.querySelector('#edit-tracker-container');
            const dnd = new Dnd(parent, handleDisplayNewOrder, handleSaveNewOrder);
            globalDnd = dnd;
        }

    });

    useEffect(() => {
        const order = trackers.map(t => t.name);
        setTrackerOrder(order);
        if (globalDnd) {
            globalDnd.dataArray = order;
        }
    }, [trackers])

    const handleDisplayNewOrder = (order) => {
        setTrackerOrder(order);
    }

    const trackerList = (<div className="notebook-tracker" hidden={isEditMode}>
        {trackers.map(t => <Tracker
            tracker={t}
            key={t.name}
            handleChange={(value) => handleChangeTrackerValue(t.name, value)}
        />)}
    </div>)

    const editTrackerList = (<div id="edit-tracker-container" className="notebook-tracker" hidden={!isEditMode}>
        {trackerOrder.map(name => {
            const t = trackers.filter(t => t.name === name)[0];
            if (!t) {
                return null;
            }
            return <EditTracker
                tracker={t}
                key={t.name}
                handleDeleteTracker={async () => {
                    await handleDeleteTracker(t.name)
                }} 
            />
        })}
    </div>)

    return <>
        {trackerList}
        {editTrackerList}
        <div className='tracker-toolbar'>
            {isEditMode ?
                <>
                    <IoIosAddCircle className='icon' onClick={() => {
                        setIsAddingTracker(true);
                        setNewTrackerDetails({
                            name: '',
                            type: null,
                        })
                    }} />
                    <IoIosCloseCircle onClick={() => {
                        setIsEditMode(false);
                    }} className='icon' />
                </> :
                <>
                    <IoMdSettings onClick={() => {
                        setIsEditMode(true);
                    }} className='icon' />
                </>
            }
        </div>
        <Modal
            isOpen={isAddingTracker}
            onClose={() => setIsAddingTracker(false)}
        >
            <div>
                <div className="input-group">

                    <label>Tracker Name</label>
                    <input
                        type="text"
                        className='full-width'
                        placeholder='Tracker Name'
                        value={newTrackerDetails.name}
                        onChange={e => {
                            setNewTrackerDetails({ ...newTrackerDetails, name: e.target.value });
                        }} />
                </div>

                <div className="input-group">

                    <label>Tracker Type</label>
                    <div className='centered-message tracker-types-list'>
                        <button
                            className={`btn mr-3 ${newTrackerDetails.type === 'Binary' && 'selected'}`}
                            onClick={() => {
                                const { min, max, ...t } = newTrackerDetails;
                                setNewTrackerDetails({ ...t, type: 'Binary' });
                            }}
                        >Binary</button>
                        <button
                            className={`btn ${newTrackerDetails.type === 'Number' && 'selected'}`}
                            onClick={() => {
                                const { min = 0, max = 10, ...t } = newTrackerDetails;
                                setNewTrackerDetails({ ...t, type: 'Number', min, max });
                            }}
                        >Number</button>
                    </div>
                </div>

                {
                    newTrackerDetails.type === 'Number' &&
                    <>
                        <div className="input-group">

                            <label>Min</label>
                            <input
                                type="number"
                                className='full-width'
                                placeholder='Minimum Value'
                                value={newTrackerDetails.min}
                                onChange={e => {
                                    setNewTrackerDetails({ ...newTrackerDetails, min: e.target.value });
                                }} />
                        </div>

                        <div className="input-group">

                            <label>Max</label>
                            <input
                                type="number"
                                className='full-width'
                                placeholder='Maximum Value'
                                value={newTrackerDetails.max}
                                onChange={e => {
                                    setNewTrackerDetails({ ...newTrackerDetails, max: e.target.value });
                                }} />
                        </div>

                    </>
                }
                <div className="centered-message" style={{ marginTop: '2em' }}>
                    {isAddingLoading ?
                        <IoMdSync className='icon icon-spinner' /> :
                        <>
                            <IoIosAddCircleOutline className='icon' onClick={async () => {
                                setisAddingLoading(true);
                                await handleAddTracker(newTrackerDetails);
                                setisAddingLoading(false);
                                setIsAddingTracker(false);
                            }} />
                            <IoIosCloseCircleOutline className='icon' onClick={() => setIsAddingTracker(false)} />
                        </>
                    }
                </div>
            </div>
        </Modal>
    </>
}

export default TrackerManager;