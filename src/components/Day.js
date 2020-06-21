import React from 'react';
import moment from 'moment';
import { List } from 'immutable'
import { Editor, ContentBlock, EditorState, genKey, RichUtils, convertToRaw, convertFromRaw, Modifier } from 'draft-js';
import { IoIosArrowDropleftCircle, IoIosArrowDroprightCircle, IoIosMenu, IoIosClose } from 'react-icons/io';
import Debounce from 'awesome-debounce-promise';
import 'draft-js/dist/Draft.css'

import JournalEntryAPI from '../models/JournalEntryAPI';
import TrackerManager from './TrackerManager';
import { CustomLabel2 } from './CustomLabel';
import './Day.css';
import TrackerAPI from '../models/TrackerAPI';

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
            isTrackerPanelOpen: false
        }

        const { date } = props;
        if (date) {
            this.state.date = date;
        }
    }

    async componentDidMount() {
        if (this._UNMOUNTED) { return; }
        const { date } = this.state;
        let journalEntry = {}, trackers = [];
        try {
            journalEntry = await JournalEntryAPI.getOrCreateJournalEntry(date);
            trackers = await TrackerAPI.getTrackerValues(date);
        } catch (error) {
            document.dispatchEvent(new CustomEvent('custom-error', {
                detail: {
                    message: error.message,
                    type: 'red'
                }
            }));
        }
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
                    handleChangeBlockType: this.handleMakeType,
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
        let journalEntry = {}, trackers = [];
        try {
            journalEntry = await JournalEntryAPI.getOrCreateJournalEntry(date);
            trackers = await TrackerAPI.getTrackerValues(date);
        } catch (error) {
            document.dispatchEvent(new CustomEvent('custom-error', {
                detail: {
                    message: error.message,
                    type: 'red'
                }
            }));
        }
        const editorState = computeEditorState(journalEntry);
        this.setState({ date, journalEntry, editorState, trackers, isLoading: false });
    }

    handleDeleteBlock = (blockKey) => {
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
        
        // @todo error check
        const tmrwEntry = await JournalEntryAPI.getOrCreateJournalEntry(date);

        const tmrwRawContentState = tmrwEntry.contentState || {
            blocks: [],
            entityMap: {}
        };
        tmrwRawContentState.blocks.push(migrateBlock);
        const updatedTmrwEntry = { ...tmrwEntry, contentState: tmrwRawContentState};
        this.handleDeleteBlock(blockKey);
        // @todo technically need fixing saving logic here
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
        try {
            await JournalEntryAPI.updateJournalEntry(date, updatedJournalEntry);
        } catch (error) {
            document.dispatchEvent(new CustomEvent('custom-error', {
                detail: {
                    message: error.message,
                    type: 'red'
                }
            }));
        }
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
        try {
            await TrackerAPI.updateTrackerValue(date, trackers)
        } catch (error) {
            document.dispatchEvent(new CustomEvent('custom-error', {
                detail: {
                    message: error.message,
                    type: 'red'
                }
            }));
        }

        this.setState({ isSaving: false });
    }, 500);

    handleAddTracker = async (trackerDetails) => {
        let newTrackers = [];
        try {
            newTrackers = await TrackerAPI.createTracker(trackerDetails);
            const trackers = TrackerAPI.getTrackerValuesFromTrackers(this.state.date, newTrackers);
            this.setState({ trackers });    
        } catch (error) {
            document.dispatchEvent(new CustomEvent('custom-error', {
                detail: {
                    message: error.message,
                    type: 'red'
                }
            }));
        }
    }

    handleDeleteTracker = async (name) => {
        let newTrackers = [];
        try {
            newTrackers = await TrackerAPI.deleteTracker(name);
        } catch (error) {
            document.dispatchEvent(new CustomEvent('custom-error', {
                detail: {
                    message: error.message,
                    type: 'red'
                }
            }));
        }
        const trackers = TrackerAPI.getTrackerValuesFromTrackers(this.state.date, newTrackers);
        this.setState({ trackers });
    }

    render() {
        const { trackers, date, editorState, isLoading, isSaving, isTrackerPanelOpen } = this.state;
        const readableDate = moment(date).format('MMMM D, YYYY');

        return <>
            <div className="notebook-header">
                <IoIosMenu 
                className='icon panel-toggle'
                onClick={() => this.setState({ isTrackerPanelOpen: true })}
                />
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
                        <div className={`notebook-panel ${isTrackerPanelOpen ? 'open' : ''}`}>
                        <IoIosClose 
                        className='icon panel-close'
                        onClick={() => this.setState({ isTrackerPanelOpen: false })}/>
                            <TrackerManager
                                handleChangeTrackerValue={this.handleChangeTrackerValue}
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
                                onChange={this.handleChange}
                                handleReturn={this.handleReturn}
                                handleKeyCommand={this.handleKeyCommand}
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

