import React, { useState } from 'react';
import { IoIosCheckmark, IoIosClose, IoIosArrowForward } from 'react-icons/io';
import { EditorBlock } from 'draft-js';

export const CustomLabel2 = (props) => {
    const { block, blockProps: { handleChangeBlockType, handleDeleteBlock, handleMigrateBlock } } = props;
    const [type, modifier] = block.getType().split('-');
    const [isShowingOptions, setIsShowingOptions] = useState(false);
    let text = 'Undefined';
    switch (type) {
        case 'task':
            text = 'TASK';
            break;
        case 'note':
            text = 'NOTE';
            break;
        case 'event':
            text = 'EVENT'
            break;
        default:
    }
    const isDone = modifier === 'done';
    return <div className={`custom-block ${isDone && 'done'}`}>
        {isShowingOptions ?
            <div className="action-container" onMouseLeave={() => setIsShowingOptions(false)}>
                <IoIosCheckmark className="icon" onClick={() => {
                    if (isDone) {
                        handleChangeBlockType(`${type}`);
                    } else {
                        handleChangeBlockType(`${type}-done`);
                    }
                    setIsShowingOptions(false);
                }} />
                <IoIosClose className="icon" onClick={() => {
                    handleDeleteBlock(block.getKey());
                }} />
                <IoIosArrowForward className="icon icon-sm" onClick={() => {
                    handleMigrateBlock(block.getKey());
                }} />
            </div> :
            <button contentEditable={false} className='btn' onMouseEnter={() => setIsShowingOptions(true)}>
                {text}
            </button>
        }
        <EditorBlock {...props} />
    </div>
}


export const CustomLabel = ({ type, children }) => {
    const [isShowingOptions, setIsShowingOptions] = useState(false);
    let text = 'Undefined';
    switch (type) {
        case 'task':
            text = 'TASK';
            break;
        case 'note':
            text = 'NOTE';
            break;
        case 'event':
            text = 'EVENT'
            break;
        default:
    }
    return <div className="custom-section">
        {children.map((child, i) => {
            return <div key={i} className="custom-block">
                {isShowingOptions ?
                    <div className="tracker-edit-container" onMouseLeave={() => setIsShowingOptions(false)}>
                        <IoIosCheckmark className="icon" />
                        <IoIosClose className="icon" />
                    </div> :
                    <span contentEditable={false} className='custom-label' onMouseEnter={() => setIsShowingOptions(true)}>
                        {text}
                    </span>
                }
                {child}
            </div>
        })}
    </div>
}