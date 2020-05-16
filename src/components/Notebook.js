import React from 'react';
import { Redirect, withRouter } from 'react-router-dom';

import './Notebook.css'
import Day from './Day';

class Notebook extends React.Component {
    state = {
        journalEntry: null
    }

    render() {
        if (!this.props.user) {
            return <Redirect to='/login' />;
        }
        return <div className='notebook'>
            <div className='notebook-container'>
                <Day />
            </div>
            <div className="notebook-labels">
                <button>Day</button>
                <button>Month</button>
                <button>Year</button>
                <button>Visualizations</button>
            </div>
        </div>
    }
}

export default withRouter(Notebook);
