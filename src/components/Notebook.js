import React from 'react';
import { Redirect, withRouter, Switch, Route } from 'react-router-dom';

import './Notebook.css'
import Day from './Day';
import Visualization from './D3Visualization';

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
                    <Route exact={true} path='/visualization' component={Visualization} />
                    <Route path='/' component={Day} />
                </Switch>
            </div>
            <div className="notebook-labels">
                <button onClick={(e) => {this.props.history.push('/')}}>Day</button>
                <button>Month</button>
                <button>Year</button>
                <button onClick={(e) => {this.props.history.push('/visualization')}}>Visualizations</button>
            </div>
        </div>
    }
}

export default withRouter(Notebook);
