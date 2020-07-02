import React, { useState } from 'react';
import { IoIosCheckmark, IoIosClose, IoIosArrowForward } from 'react-icons/io';
import { EditorBlock } from 'draft-js';
import { useRef } from 'react';

export const CustomLabel2 = (props) => {
    const blockNode = useRef(null);
    const { block, blockProps: { handleChangeBlockType, handleDeleteBlock, handleMigrateBlock } } = props;
    const [type, modifier] = block.getType().split('-');
    const [isShowingOptions, setIsShowingOptions] = useState(false);
    const [defaultHeight, setDefaultHeight] = useState(null);
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

    const style = defaultHeight !== null ? { height: `${defaultHeight}px` } : {}
    const isDone = modifier === 'done';
    return <div ref={blockNode} className={`custom-block ${isDone && 'done'}`} style={style}>
        {isShowingOptions ?
            <div className="action-container">
                <IoIosCheckmark className="icon icon-lg" onClick={() => {
                    if (isDone) {
                        handleChangeBlockType(`${type}`);
                    } else {
                        handleChangeBlockType(`${type}-done`);
                    }
                    setIsShowingOptions(false);
                }} />
                <IoIosClose className="icon icon-lg" onClick={() => {
                    handleDeleteBlock(block.getKey());
                }} />
                <IoIosArrowForward className="icon" onClick={() => {
                    handleMigrateBlock(block.getKey());
                }} />
            </div> :
            <button contentEditable={false} className='btn custom-label' onClick={() => {
                setIsShowingOptions(true)
                const height = blockNode.current.clientHeight;
                setDefaultHeight(height);
                const cancelHandler = (e) => {
                    setDefaultHeight(null);
                    setIsShowingOptions(false);
                    document.removeEventListener('click', cancelHandler);
                };
                document.addEventListener('click', cancelHandler);
            }}>
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