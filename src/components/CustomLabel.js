import React, { useState, useEffect } from 'react';
import { IoIosCheckmark, IoIosClose, IoIosArrowForward } from 'react-icons/io';
import { BsCircle, BsCircleFill, BsFillSquareFill } from 'react-icons/bs';
import { EditorBlock } from 'draft-js';
import { useRef } from 'react';

let _UNMOUNTED = false;

export const CustomLabel2 = (props) => {
    const blockNode = useRef(null);
    const { block, blockProps: { handleChangeBlockType, handleDeleteBlock, handleMigrateBlock } } = props;
    const [type, modifier] = block.getType().split('-');
    const [isShowingOptions, setIsShowingOptions] = useState(false);
    const [defaultHeight, setDefaultHeight] = useState(null);

    const handleChangeToShowingOptions = (e) => {
        e.stopPropagation();
        blockNode.current.style.transform=`translate(0, 0)`
        const height = blockNode.current.clientHeight;
        setIsShowingOptions(true)
        setDefaultHeight(height);
        const cancelHandler = (e) => {
            if (_UNMOUNTED) {return;}
            e.stopPropagation();
            setDefaultHeight(null);
            setIsShowingOptions(false);
            document.removeEventListener('click', cancelHandler);
            document.removeEventListener('touchstart', cancelHandler);
        };
        document.addEventListener('click', cancelHandler);
        document.addEventListener('touchstart', cancelHandler);
    }

    const handleMarkDone = (e) => {
        e.stopPropagation();
        if (isDone) {
            handleChangeBlockType(block.getKey(), `${type}`);
        } else {
            handleChangeBlockType(block.getKey(), `${type}-done`);
        }
        setIsShowingOptions(false);
    }

    const handleDelete = (e) => {
        e.stopPropagation();
        handleDeleteBlock(block.getKey());
    }

    const handleMigrate = (e) => {
        e.stopPropagation();
        handleMigrateBlock(block.getKey());
    }

    useEffect(() => {
        const swiper = new Swipe(blockNode.current);
        swiper.onRightTransition = (xDiff) => {
            blockNode.current.style.transform=`translate(${xDiff}px, 0)`
        };

        swiper.onResetTransition = () => {
            if (blockNode.current) {
                blockNode.current.style.transform=`translate(0, 0)`
            }
        }
        swiper.onRight = handleChangeToShowingOptions;
        swiper.run();

        return function cleanup() {
            swiper.remove();
            _UNMOUNTED = true;
        }
    }, []);

    let text = 'Undefined';
    let Symbol = BsCircleFill;
    switch (type) {
        case 'task':
            text = 'TASK';
            Symbol = BsCircleFill;
            break;
        case 'note':
            text = 'NOTE';
            Symbol = BsFillSquareFill;
            break;
        case 'event':
            text = 'EVENT';
            Symbol = BsCircle;
            break;
        default:
    }

    const style = defaultHeight !== null ? { height: `${defaultHeight}px` } : {}
    const isDone = modifier === 'done';
    return <div ref={blockNode} className={`custom-block ${isDone && 'done'}`} style={style}>
        {isShowingOptions ?
            <div className="action-container">
                <IoIosCheckmark className="icon icon-lg" onClick={handleMarkDone} onTouchStart={handleMarkDone} />
                <IoIosClose className="icon icon-lg" onClick={handleDelete} onTouchStart={handleDelete} />
                <IoIosArrowForward className="icon" onClick={handleMigrate} onTouchStart={handleMigrate}/>
            </div> :
            <>
                <Symbol className="custom-label-mobile"></Symbol>
                <button contentEditable={false} className='btn custom-label' onClick={handleChangeToShowingOptions} onTouchEnd={handleChangeToShowingOptions}>
                    {text}
                </button>
            </>
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

class Swipe {
    constructor(element) {
        this.xDown = null;
        this.element = typeof(element) === 'string' ? document.querySelector(element) : element;

        this.touchStartHandler = (evt) => {
            this.xDown = evt.touches[0].clientX;
        }
        this.element.addEventListener('touchstart', this.touchStartHandler);
    }

    onRight() {}

    onRightTransition() {}

    onResetTransition() {}

    handleTouchMove = (evt) => {
        if ( ! this.xDown) {
            return;
        }

        var xUp = evt.touches[0].clientX;
        this.xDiff = xUp - this.xDown;

        if (this.xDiff >= 150) {
            this.onRight(evt);
        } else if (this.xDiff > 0) {
            this.onRightTransition(this.xDiff);
        }
    }

    run = () => {
        this.touchMoveHandler = (evt) => {
            this.handleTouchMove(evt);
        }

        this.touchEndHandler = (evt) => {
            this.onResetTransition();
        }

        this.element.addEventListener('touchmove', this.touchMoveHandler);
        this.element.addEventListener('touchend', this.touchEndHandler);
    }

    remove = () => {
        this.element.removeEventListener('touchstart', this.touchStartHandler);
        this.element.removeEventListener('touchmove', this.touchMoveHandler);
        this.element.removeEventListener('touchend', this.touchEndHandler);
    }
}