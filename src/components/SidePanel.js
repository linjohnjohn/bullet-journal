import React from 'react';
import './SidePanel.css';

const Modal = ({isOpen, onClose, children, className}) => {
    return <>
        <div className={`${className} backdrop-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}/>
        <div className={`${className} side-panel ${isOpen ? 'open' : ''}`}>
            {children}
        </div>
    </>
}
            
export default Modal;