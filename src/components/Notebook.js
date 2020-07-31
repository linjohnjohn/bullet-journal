import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import Day from './Day';
import LongTerm from './LongTerm';
import './Notebook.css';
import VisualizationControl from './VisualizationControl';
import Settings from './Settings';
import Payment from './Payment';


class Notebook extends React.Component {
    state = {
        journalEntry: null
    }

    render() {
        if (!this.props.user) {
            this.props.history.push({
                pathname: '/login',
                state: {
                    nextPathName: this.props.location.pathname
                }
            });
            return null;
        }
        return <div className='notebook'>
            <div className='notebook-container'>
                <Switch>
                    <Route exact={true} path='/visualization' component={VisualizationControl} />
                    <Route exact={true} path='/payment' component={Payment} />
                    <Route exact={true} path='/colors' component={Settings} />
                    <Route exact={true} path='/month' render={(props) => {
                        const { date = new Date() } = props.location.state || {}
                        return <LongTerm key={date} date={date} />
                    }} />
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
                <button onClick={(e) => { this.props.history.push('/month') }}>Month</button>
            </div>
        </div>
    }
}

export default withRouter(Notebook);
