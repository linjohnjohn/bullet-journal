import React from 'react';
import './Modal.css';

const Modal = ({isOpen, onClose, children}) => {
    if (!isOpen) {
        return null;
    }
    return <>
        <div className='backdrop-overlay open' onClick={onClose}/>
        <div className="modal">
            {children}
        </div>
    </>
}
            
export default Modal;