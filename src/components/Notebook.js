import React from 'react';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';
import Day from './Day';
import './Notebook.css';
import VisualizationControl from './VisualizationControl';
import Settings from './Settings';


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
                    <Route exact={true} path='/settings' component={Settings} />
                    <Route path='/' render={(props) => {
                        const { date = new Date() } = props.location.state || {}
                        return <Day key={date} date={date} />
                    }} />
                </Switch>
            </div>
            <div className="notebook-labels">
                <button onClick={(e) => { this.props.history.push('/') }}>Today</button>
                <button onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    this.props.history.push({ pathname: '/', state: { date: d } })
                }}>Tomorrow</button>
                <button onClick={(e) => { this.props.history.push('/visualization') }}>Tracker</button>
            </div>
        </div>
    }
}

export default withRouter(Notebook);
