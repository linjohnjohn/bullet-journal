import React from 'react';
import moment from 'moment';
import Immutable from 'immutable'
import { Editor, EditorState, RichUtils, DefaultDraftBlockRenderMap, convertToRaw, convertFromRaw, Modifier } from 'draft-js';
import { IoIosArrowDropleftCircle, IoIosArrowDroprightCircle } from 'react-icons/io';
import Debounce from 'awesome-debounce-promise';
import 'draft-js/dist/Draft.css'

import JournalEntryAPI from '../models/JournalEntryAPI';
import Tracker from './Tracker';
import './Day.css';
import TrackerAPI from '../models/TrackerAPI';

const CustomLabel = ({ type, children }) => {
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
                <span contentEditable={false} className='custom-label'>{text}</span>
                {child}
            </div>
        })}
    </div>
}

const blockRenderMap = Immutable.Map({
    'task': {
        wrapper: <CustomLabel type='task' />,
    },
    'note': {
        wrapper: <CustomLabel type='note' />
    },
    'event': {
        wrapper: <CustomLabel type='event' />
    }
});
const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(blockRenderMap);


const computeEditorState = (journalEntry) => {
    let editorState;
    if (journalEntry.contentState) {
        const contentState = convertFromRaw(journalEntry.contentState)
        editorState = EditorState.createWithContent(contentState);
    } else {
        editorState = EditorState.createEmpty();
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
        const { date } = this.state;
        const journalEntry = await JournalEntryAPI.getOrCreateJournalEntry(date);
        const trackers = await TrackerAPI.getTrackerValues(date);
        const editorState = computeEditorState(journalEntry);
        this.setState({ journalEntry, editorState, trackers, isLoading: false });
    }

    handleIncrementDate = async (i) => {
        const { date } = this.state;
        date.setDate(date.getDate() + i);
        this.setState({ isLoading: true });
        const journalEntry = await JournalEntryAPI.getOrCreateJournalEntry(date);
        const trackers = await TrackerAPI.getTrackerValues(date);
        const editorState = computeEditorState(journalEntry);
        this.setState({ date, journalEntry, editorState, trackers, isLoading: false });
    }

    handleChange = (editorState) => {
        this.setState({ editorState, isSaving: true });
        this.handleSave();
    }

    handleSave = Debounce(async () => {
        const { editorState, journalEntry, date } = this.state;
        const contentState = convertToRaw(editorState.getCurrentContent());
        const updatedJournalEntry = { ...journalEntry, contentState };
        await JournalEntryAPI.updateJournalEntry(date, updatedJournalEntry);
        this.setState({ isSaving: false });
    }, 500);

    // handleTab = (e) => {
    //     const { editorState } = this.state;
    //     const newState = RichUtils.onTab(e, editorState, 3);
    //     this.handleChange(newState);
    //     return 'nothandled';
    // }

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

    handleTrackerChange = (name, value) => {
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
        this.handleSaveTracker();
    }

    handleSaveTracker = Debounce(async () => {
        const { trackers, date } = this.state;
        await TrackerAPI.updateTrackerValue(date, trackers)
        this.setState({ isSaving: false });
        //@todo handle saved notification
    }, 500);

    // handleTrackerSave = () => {

    // }

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
                        <div className="notebook-tracker">
                            {trackers.map(t => <Tracker
                                tracker={t}
                                key={t.name}
                                handleChange={(value) => this.handleTrackerChange(t.name, value)}
                            />)}
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
                                blockRenderMap={extendedBlockRenderMap}
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

