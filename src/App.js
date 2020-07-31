import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch, withRouter } from 'react-router-dom'
import firebase from 'firebase';


import './models/firebase';
import { setColorTheme } from './util/colors';
import Home from './components/Notebook';
import Navbar from './components/Navbar';
import Errors from './components/Errors';
import './App.css';
import UserAPI from './models/UserAPI';

const provider = new firebase.auth.GoogleAuthProvider();

class App extends React.Component {
  state = {
    user: null,
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        try {
          await UserAPI.initializeUser();
          const theme = await UserAPI.getColorTheme();
          setColorTheme(theme);
        } catch (error) {
          document.dispatchEvent(new CustomEvent('custom-error', {
            detail: {
              message: error.message,
              type: 'red'
            }
          }));
        }
        this.setState({ user });
      } else {
        this.setState({ user: null });
      }
    })
  }

  handleGoogleLogin = () => {
    firebase.auth().signInWithPopup(provider).then((result) => {
      var token = result.credential.accessToken;
      var user = result.user;
      // this.setState({ user })
    }).catch(function (error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      var email = error.email;
      var credential = error.credential;
    });
  }

  handleGoogleLogout = () => {
    firebase.auth().signOut();
  }

  render() {
    const { user } = this.state;
    const nextPathName = this.props.location.state && this.props.location.state.nextPathName || '/';

    return <Errors>
        <Navbar
          user={user}
          handleGoogleLogin={this.handleGoogleLogin}
          handleGoogleLogout={this.handleGoogleLogout}
        />
        <div className="journal-body">
          <Switch>
            <Route exact={true} path='/login'>
              {user ? <Redirect to={nextPathName} /> : <div className='notebook'>
                <div className="notebook-container centered-message">
                  <p style={{ fontSize: '2em' }}>Welcome to Mr. Bullet. Please login to see your journal!</p>
                </div>
              </div>}
            </Route>
            <Route path='/'>
              <Home user={user} />
            </Route>
          </Switch>
        </div>
    </Errors>
  }
}

export default withRouter(App);
