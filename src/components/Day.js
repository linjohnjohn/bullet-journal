import React, { useState } from 'react';
import moment from 'moment';
import Immutable, { List } from 'immutable'
import { Editor, EditorBlock, ContentBlock, EditorState, genKey, RichUtils, DefaultDraftBlockRenderMap, convertToRaw, convertFromRaw, Modifier } from 'draft-js';
import { IoIosArrowDropleftCircle, IoIosArrowDroprightCircle, IoIosCheckmark, IoIosClose, IoIosArrowForward } from 'react-icons/io';
import Debounce from 'awesome-debounce-promise';
import 'draft-js/dist/Draft.css'

import JournalEntryAPI from '../models/JournalEntryAPI';
import TrackerManager from './TrackerManager';
import './Day.css';
import TrackerAPI from '../models/TrackerAPI';

const CustomLabel = ({ type, children }) => {
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

const CustomLabel2 = (props) => {
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
                        handleChangeBlockType(block.getKey(), `${type}`);
                    } else {
                        handleChangeBlockType(block.getKey(), `${type}-done`);
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

// const blockRenderMap = Immutable.Map({
//     'task': {
//         wrapper: <CustomLabel type='task' />,
//     },
//     'note': {
//         wrapper: <CustomLabel type='note' />
//     },
//     'event': {
//         wrapper: <CustomLabel type='event' />
//     }
// });
// const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(blockRenderMap);


const computeEditorState = (journalEntry) => {
    let editorState;
    if (journalEntry.contentState) {
        const contentState = convertFromRaw(journalEntry.contentState)
        editorState = EditorState.createWithContent(contentState);
    } else {
        editorState = EditorState.createWithContent(convertFromRaw({
            blocks: [],
            entityMap: {}
        }));
    }

    return editorState;
}

export default class Day extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            date: new Date(),
            journalEntry: null,
            editorState: EditorState.createEmpty(),
            trackers: [],
            isLoading: true,
            isSaving: false,
        }

        const { date } = props;
        if (date) {
            this.state.date = date;
        }
    }

    async componentDidMount() {
        if (this._UNMOUNTED) { return; }
        const { date } = this.state;
        const journalEntry = await JournalEntryAPI.getOrCreateJournalEntry(date);
        const trackers = await TrackerAPI.getTrackerValues(date);
        const editorState = computeEditorState(journalEntry);
        this.setState({ journalEntry, editorState, trackers, isLoading: false });
    }

    componentWillUnmount() {
        this._UNMOUNTED = true;
    }

    blockRenderer = (contentBlock) => {
        const type = contentBlock.getType().split('-')[0];
        if (type === 'task' || type === 'note' || type === 'event') {
            return {
                component: CustomLabel2,
                props: {
                    handleChangeBlockType: this.handleChangeBlockType,
                    handleDeleteBlock: this.handleDeleteBlock,
                    handleMigrateBlock: this.handleMigrateBlock
                }
            }
        }
    }

    handleIncrementDate = async (i) => {
        let { date } = this.state;
        date = new Date(date.getTime());
        date.setDate(date.getDate() + i);
        this.setState({ isLoading: true });
        const journalEntry = await JournalEntryAPI.getOrCreateJournalEntry(date);
        const trackers = await TrackerAPI.getTrackerValues(date);
        const editorState = computeEditorState(journalEntry);
        this.setState({ date, journalEntry, editorState, trackers, isLoading: false });
    }

    handleChangeBlockType = async (blockKey, type) => {
        // const { editorState } = this.state;
        // const selectionState = SelectionState.createEmpty(blockKey);
        // let newEditorState = EditorState.acceptSelection(editorState, selectionState);
        // await this.setState({ editorState, newEditorState });
        this.handleMakeType(type);
    }

    handleDeleteBlock = async (blockKey) => {
        const { editorState } = this.state;
        const contentState = editorState.getCurrentContent();
        let newBlockMap = contentState.getBlockMap().delete(blockKey);
        if (newBlockMap.size === 0) {
            const newBlock = new ContentBlock({
                key: genKey(),
                type: 'unstyled',
                text: '',
                characterList: List()
            });
            newBlockMap = newBlockMap.set(newBlock.key, newBlock);
        }
        const newContentState = contentState.set('blockMap', newBlockMap);
        const newEditorState = EditorState.push(editorState, newContentState, 'remove-range');
        this.handleChange(newEditorState);
    }

    handleMigrateBlock = async (blockKey) => {
        let { date, editorState } = this.state;
        date = new Date(date.getTime());
        date.setDate(date.getDate() + 1);

        const contentState = editorState.getCurrentContent();
        const rawContentState = convertToRaw(contentState);
        let migrateBlock = rawContentState.blocks.filter(b => b.key === blockKey)[0];
        migrateBlock = { ...migrateBlock, key: genKey() }
        const tmrwEntry = await JournalEntryAPI.getOrCreateJournalEntry(date);

        const tmrwRawContentState = tmrwEntry.contentState || {
            blocks: [],
            entityMap: {}
        };
        tmrwRawContentState.blocks.push(migrateBlock);
        const updatedTmrwEntry = { ...tmrwEntry, contentState: tmrwRawContentState};
        this.handleDeleteBlock(blockKey);
        await JournalEntryAPI.updateJournalEntry(date, updatedTmrwEntry);
    }

    handleChange = (editorState) => {
        this.setState({ editorState, isSaving: true });
        this.handleSave();
    }

    handleSave = Debounce(async () => {
        if (this._UNMOUNTED) { return; }
        const { editorState, journalEntry, date } = this.state;
        const contentState = convertToRaw(editorState.getCurrentContent());
        const updatedJournalEntry = { ...journalEntry, contentState };
        await JournalEntryAPI.updateJournalEntry(date, updatedJournalEntry);
        this.setState({ isSaving: false });
    }, 500);


    handleReturn = (e) => {
        e.preventDefault();
        const { editorState } = this.state;
        const contentState = editorState.getCurrentContent();
        const selectionState = editorState.getSelection();
        const newContentState = Modifier.splitBlock(contentState, selectionState);
        const newEditorState = EditorState.push(editorState, newContentState, 'split-block');
        this.handleChange(newEditorState)
        return 'handled';

    }

    handleKeyCommand = (command, editorState) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            this.handleChange(newState);
            return 'handled';
        }
        return 'not-handled';
    }

    handleMakeType = (type) => {
        const { editorState } = this.state;
        const contentState = editorState.getCurrentContent();
        const selectionState = editorState.getSelection();
        const newContentState = Modifier.setBlockType(contentState, selectionState, type);
        const newEditorState = EditorState.push(editorState, newContentState, 'change-block-type');
        this.handleChange(newEditorState);
    }

    handleChangeTrackerValue = (name, value) => {
        const { trackers } = this.state;
        const i = trackers.findIndex(t => t.name === name);
        const oldTracker = trackers[i];
        const newTrackers = Object.assign([], trackers, {
            [i]: {
                ...oldTracker,
                value
            }
        });
        this.setState({ trackers: newTrackers, isSaving: true });
        this.handleSaveTrackerValue();
    }

    handleSaveTrackerValue = Debounce(async () => {
        if (this._UNMOUNTED) { return; }
        const { trackers, date } = this.state;
        await TrackerAPI.updateTrackerValue(date, trackers)
        this.setState({ isSaving: false });
        //@todo handle saved notification
    }, 500);

    handleAddTracker = async (trackerDetails) => {
        const newTrackers = await TrackerAPI.createTracker(trackerDetails);
        const trackers = TrackerAPI.getTrackerValuesFromTrackers(this.state.date, newTrackers);
        this.setState({ trackers });
    }

    handleDeleteTracker = async (name) => {
        const newTrackers = await TrackerAPI.deleteTracker(name);
        const trackers = TrackerAPI.getTrackerValuesFromTrackers(this.state.date, newTrackers);
        this.setState({ trackers });
    }

    render() {
        const { trackers, date, editorState, isLoading, isSaving } = this.state;
        const readableDate = moment(date).format('MMMM D, YYYY');

        return <>
            <div className="notebook-header">
                <IoIosArrowDropleftCircle
                    className='icon'
                    onClick={() => this.handleIncrementDate(-1)} />
                <span>{readableDate}</span>
                <IoIosArrowDroprightCircle
                    className='icon'
                    onClick={() => this.handleIncrementDate(1)} />
            </div>

            {isLoading ?
                <div className="centered-message">
                    <p>Flipping to journal page...</p>
                </div> :
                <>
                    <div className="notebook-body">
                        <div className="notebook-tracker-container">
                            <TrackerManager
                                handleChangeTrackerValue={this.handleChangeTrackerValue}
                                handleEditTrackerName={this.handleEditTrackerName}
                                handleAddTracker={this.handleAddTracker}
                                handleDeleteTracker={this.handleDeleteTracker}
                                trackers={trackers} />
                        </div>
                        <div className="notebook-editor">
                            <div className='notes-toolbar'>
                                <button className='btn' onClick={() => this.handleMakeType('task')}>Task</button>
                                <button className='btn' onClick={() => this.handleMakeType('note')}>Note</button>
                                <button className='btn' onClick={() => this.handleMakeType('event')}>Event</button>
                            </div>
                            <Editor
                                editorState={editorState}
                                // onTab={this.handleTab}
                                onChange={this.handleChange}
                                handleReturn={this.handleReturn}
                                handleKeyCommand={this.handleKeyCommand}
                                // blockRenderMap={extendedBlockRenderMap}
                                blockRendererFn={this.blockRenderer}
                            />
                        </div>
                    </div>
                    <div className="notebook-footer">
                        {isSaving ?
                            <p>Writing to journal...</p> :
                            <p>Journal up to date</p>}
                    </div>
                </>
            }

        </>
    }
}

