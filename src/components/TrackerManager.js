import React, { useState } from "react";
import { IoMdSettings, IoIosAddCircle, IoIosCloseCircle, IoIosAddCircleOutline, IoIosCloseCircleOutline, IoIosSync, IoMdSync } from 'react-icons/io';

import Tracker from './Tracker';
import Modal from './Modal';
import EditTracker from './EditTracker';
import './TrackerManager.css'

const TrackerManager = ({
    trackers,
    handleAddTracker,
    handleDeleteTracker
}) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isAddingTracker, setIsAddingTracker] = useState(false);
    const [isAddingLoading, setIsAddingLoading] = useState(false);
    const [newTrackerDetails, setNewTrackerDetails] = useState({
        name: '',
        type: null,
    });

    let trackerList = (<div className="notebook-tracker">
        {trackers.map(t => <Tracker
            tracker={t}
            key={t.name}
            handleChange={(value) => this.handleChangeTrackerValue(t.name, value)}
        />)}
    </div>)
    if (isEditMode) {
        trackerList = (<div className="notebook-tracker">
            {trackers.map(t => <EditTracker
                tracker={t}
                key={t.name}
                handleEditTrackerName={(newName) => this.handleEditTrackerName(t.name, newName)}
                handleDeleteTracker={() => handleDeleteTracker(t.name)}
            />)}
        </div>)
    }

    return <>
        {trackerList}
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
            <div style={{ width: 'min(300px, 90vw)' }}>
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
                    <div className='centered-message'>
                        <button
                            className={`btn ${newTrackerDetails.type === 'Binary' && 'selected'}`}
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
                                setIsAddingLoading(true);
                                await handleAddTracker(newTrackerDetails);
                                setIsAddingLoading(false);
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