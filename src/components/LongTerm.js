import React from 'react';
import moment from 'moment';
import { List } from 'immutable'
import { Editor, ContentBlock, EditorState, genKey, RichUtils, convertToRaw, convertFromRaw, Modifier } from 'draft-js';
import { IoIosArrowDropleftCircle, IoIosArrowDroprightCircle } from 'react-icons/io';
import Debounce from 'awesome-debounce-promise';
import 'draft-js/dist/Draft.css'

import MonthJournalEntryAPI from '../models/MonthJournalEntryAPI';
import { CustomLabel2 } from './CustomLabel';
import './Day.css';

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
        let journalEntry = {};
        try {
            // @todo
            journalEntry = await MonthJournalEntryAPI.getOrCreateJournalEntry(date);
        } catch (error) {
            document.dispatchEvent(new CustomEvent('custom-error', {
                detail: {
                    message: error.message,
                    type: 'red'
                }
            }));
        }
        const editorState = computeEditorState(journalEntry);
        this.setState({ journalEntry, editorState, isLoading: false });
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

    handleIncrementMonth = async (i) => {
        let { date } = this.state;
        date = new Date(date.getTime());
        date.setMonth(date.getMonth() + i);
        this.setState({ isLoading: true });
        let journalEntry = {};
        try {
            // @todo
            journalEntry = await MonthJournalEntryAPI.getOrCreateJournalEntry(date);
        } catch (error) {
            document.dispatchEvent(new CustomEvent('custom-error', {
                detail: {
                    message: error.message,
                    type: 'red'
                }
            }));
        }
        const editorState = computeEditorState(journalEntry);
        this.setState({ date, journalEntry, editorState, isLoading: false });
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
        date.setMonth(date.getMonth() + 1);

        const contentState = editorState.getCurrentContent();
        const rawContentState = convertToRaw(contentState);
        let migrateBlock = rawContentState.blocks.filter(b => b.key === blockKey)[0];
        migrateBlock = { ...migrateBlock, key: genKey() }

        // @todo error check
        const tmrwEntry = await MonthJournalEntryAPI.getOrCreateJournalEntry(date);

        const tmrwRawContentState = tmrwEntry.contentState || {
            blocks: [],
            entityMap: {}
        };
        tmrwRawContentState.blocks.push(migrateBlock);
        const updatedTmrwEntry = { ...tmrwEntry, contentState: tmrwRawContentState };
        this.handleDeleteBlock(blockKey);
        // @todo technically need fixing saving logic here
        await MonthJournalEntryAPI.updateJournalEntry(date, updatedTmrwEntry);
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
            // @todo
            await MonthJournalEntryAPI.updateJournalEntry(date, updatedJournalEntry);
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

    render() {
        const { date, editorState, isLoading, isSaving } = this.state;
        const readableDate = moment(date).format('MMM YYYY');

        return <>
            <div className="notebook-header">
                <IoIosArrowDropleftCircle
                    className='icon'
                    onClick={() => this.handleIncrementMonth(-1)} />
                <span>{readableDate}</span>
                <IoIosArrowDroprightCircle
                    className='icon'
                    onClick={() => this.handleIncrementMonth(1)} />
            </div>

            {isLoading ?
                <div className="centered-message">
                    <p>Flipping to journal page...</p>
                </div> :
                <>
                    <div className="notebook-body">
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

