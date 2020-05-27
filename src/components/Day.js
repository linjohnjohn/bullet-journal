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
    state = {
        date: new Date(),
        journalEntry: null,
        editorState: EditorState.createEmpty(),
        trackers: []
    }

    async componentDidMount() {
        const { date } = this.state;
        const journalEntry = await JournalEntryAPI.getOrCreateJournalEntry(date);
        const trackers = await TrackerAPI.getTrackerValues(date);
        const editorState = computeEditorState(journalEntry);
        this.setState({ journalEntry, editorState, trackers });
    }


    handleIncrementDate = async (i) => {
        const { date } = this.state;
        date.setDate(date.getDate() + i);
        const journalEntry = await JournalEntryAPI.getOrCreateJournalEntry(date);
        const trackers = await TrackerAPI.getTrackerValues(date);
        const editorState = computeEditorState(journalEntry);
        this.setState({ date, journalEntry, editorState, trackers });
    }

    handleChange = (editorState) => {
        this.setState({ editorState });
        this.handleSave();
    }

    handleSave = Debounce(async () => {
        const { editorState, journalEntry, date } = this.state;
        const contentState = convertToRaw(editorState.getCurrentContent());
        const updatedJournalEntry = { ...journalEntry, contentState };
        await JournalEntryAPI.updateJournalEntry(date, updatedJournalEntry);
    }, 500);

    handleTab = (e) => {
        const { editorState } = this.state;
        const newState = RichUtils.onTab(e, editorState, 3);
        this.handleChange(newState);
        return 'nothandled';
    }

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
        const newTrackers = Object.assign([], trackers, {[i]: {
            ...oldTracker,
            value
        }});
        this.setState({ trackers: newTrackers });
        this.handleSaveTracker();
    }

    handleSaveTracker = Debounce(async () => {
        const { trackers, date } = this.state;
        await TrackerAPI.updateTrackerValue(date, trackers)
        //@todo handle saved notification
    }, 500);

    // handleTrackerSave = () => {
        
    // }

    render() {
        const { journalEntry, trackers } = this.state;
        const date = (journalEntry && journalEntry.date) || Date.now();
        const readableDate = moment.utc(date).format('MMMM D, YYYY');

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
                        editorState={this.state.editorState}
                        onTab={this.handleTab}
                        onChange={this.handleChange}
                        handleReturn={this.handleReturn}
                        handleKeyCommand={this.handleKeyCommand}
                        blockRenderMap={extendedBlockRenderMap}
                    />
                </div>
            </div>
        </>
    }
}

