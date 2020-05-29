import React, { useState } from 'react';
import { IoIosTrash, IoIosMenu, IoIosCheckmarkCircleOutline, IoIosCloseCircleOutline, IoMdSync } from 'react-icons/io';
import './Tracker.css';
import Modal from './Modal';


const Tracker = ({ tracker: { name }, handleEditTrackerName, handleDeleteTracker }) => {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [isDeletingLoading, setIsDeletingLoading] = useState(false);
    return <div className='tracker-container tracker-edit-container'>
        <div className='flex-row'>
            <IoIosMenu className="icon" />
            <div className='tracker-name'>{name}</div>
        </div>
        <IoIosTrash className='icon' onClick={() => setIsConfirmingDelete(true)} />

        <Modal isOpen={isConfirmingDelete} onClose={() => setIsConfirmingDelete(false)}>
            <div className="centered-message">
                <p>
                    Are you sure you want to delete tracker: {name}
                </p>
            </div>
            <div className="centered-message">
                {isDeletingLoading ?
                    <IoMdSync className="icon icon-spinner" /> :
                    <>
                        <IoIosCheckmarkCircleOutline onClick={async () => {
                            setIsDeletingLoading(true);
                            await handleDeleteTracker();
                        }} className='icon' />
                        <IoIosCloseCircleOutline onClick={() => setIsConfirmingDelete(false)} className='icon' />
                    </>
                }
            </div>

        </Modal>
    </div>
}

export default Tracker;