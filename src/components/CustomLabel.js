import React from 'react';
import { IoIosCheckmark, IoIosClose, IoIosArrowForward } from 'react-icons/io';
import { BsCircle, BsCircleFill, BsFillSquareFill } from 'react-icons/bs';
import { EditorBlock } from 'draft-js';

import Swipeable from '../util/Swipeable';
import './CustomLabel.css';

export class CustomLabel2 extends React.Component {
    state = {
        isShowingOptions: false,
        defaultHeight: null
    }

    blockNode = React.createRef();

    componentDidMount() {
        this._UNMOUNTED = false;
    }

    componentWillUnmount() {
        this._UNMOUNTED = true;
    }

    handleChangeToShowingOptions = (e) => {
        e.stopPropagation();
        this.blockNode.current.style.transform = `translate(0, 0)`
        const height = this.blockNode.current.clientHeight;
        this.setState({
            isShowingOptions: true,
            defaultHeight: height
        });
        const cancelHandler = (e) => {
            e.stopPropagation();
            document.removeEventListener('click', cancelHandler);
            document.removeEventListener('touchstart', cancelHandler);
            if (this._UNMOUNTED || !this.state.isShowingOptions) { return; }
            this.setState({
                isShowingOptions: false,
                defaultHeight: null
            });
        };
        document.addEventListener('click', cancelHandler);
        document.addEventListener('touchstart', cancelHandler);
    }

    handleMarkDone = (e) => {
        e.stopPropagation();
        const { block, blockProps: { handleChangeBlockType } } = this.props;
        const [type, modifier] = block.getType().split('-');
        const isDone = modifier === 'done';

        if (isDone) {
            handleChangeBlockType(block.getKey(), `${type}`);
        } else {
            handleChangeBlockType(block.getKey(), `${type}-done`);
        }

        this.setState({
            isShowingOptions: false
        });
    }

    handleDelete = (e) => {
        e.stopPropagation();
        this.props.blockProps.handleDeleteBlock(this.props.block.getKey());
    }

    handleMigrate = (e) => {
        e.stopPropagation();
        this.props.blockProps.handleMigrateBlock(this.props.block.getKey());
    }


    render() {
        const { block } = this.props;
        const [type, modifier] = block.getType().split('-');
        const { isShowingOptions, defaultHeight } = this.state;

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
        return <div ref={this.blockNode} className={`custom-block ${isDone && 'done'}`} style={style}>
            {isShowingOptions ?
                <div className="action-container">
                    <IoIosCheckmark className="icon icon-lg" onClick={this.handleMarkDone} onTouchStart={this.handleMarkDone} />
                    <IoIosClose className="icon icon-lg" onClick={this.handleDelete} onTouchStart={this.handleDelete} />
                    <IoIosArrowForward className="icon" onClick={this.handleMigrate} onTouchStart={this.handleMigrate} />
                </div> :
                <>
                    <Swipeable onRightTransition={(xDiff) => {
                        this.blockNode.current.style.transform = `translate(${xDiff}px, 0)`
                    }}
                        onResetTransition={() => {
                            if (this.blockNode.current) {
                                this.blockNode.current.style.transform = `translate(0, 0)`
                            }
                        }}
                        onRight={this.handleChangeToShowingOptions}
                    >
                        <Symbol className="custom-label-mobile"></Symbol>
                    </Swipeable>
                    <button contentEditable={false} className='btn custom-label' onClick={this.handleChangeToShowingOptions} onTouchEnd={this.handleChangeToShowingOptions}>
                        {text}
                    </button>
                </>
            }
            <EditorBlock {...this.props} />
        </div>
    }
}