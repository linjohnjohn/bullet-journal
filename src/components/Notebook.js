import React from 'react';
import { Redirect, withRouter, Switch, Route } from 'react-router-dom';

import './Notebook.css'
import Day from './Day';
import VisualizationControl from './VisualizationControl';

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
                <Switch>
                    <Route exact={true} path='/visualization' component={VisualizationControl} />
                    <Route path='/' component={Day} />
                </Switch>
            </div>
            <div className="notebook-labels">
                <button onClick={(e) => {this.props.history.push('/')}}>Today</button>
                <button>Tomorrow</button>
                <button onClick={(e) => {this.props.history.push('/visualization')}}>Tracker</button>
            </div>
        </div>
    }
}

export default withRouter(Notebook);
