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
import LoginHome from './components/LoginHome';

const googleProvider = new firebase.auth.GoogleAuthProvider();
const facebookProvider = new firebase.auth.FacebookAuthProvider();

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
    firebase.auth().signInWithPopup(googleProvider).then((result) => {
      const token = result.credential.accessToken;
      const user = result.user;
      // this.setState({ user })
    }).catch(function (error) {
      const { code, message, email, credential } = error;
      console.log(error);
      document.dispatchEvent(new CustomEvent('custom-error', {
        detail: {
          message: 'We were unable to log you in. Try again!',
          type: 'red'
        }
      }));
    });
  }

  handleFacebookLogin = () => {
    firebase.auth().signInWithPopup(facebookProvider).then((result) => {
      const token = result.credential.accessToken;
      const user = result.user;
      // this.setState({ user })
    }).catch(function (error) {
      const { code, message, email, credential } = error;
      console.log(error);
      document.dispatchEvent(new CustomEvent('custom-error', {
        detail: {
          message: 'We were unable to log you in. Try again!',
          type: 'red'
        }
      }));
    });
  }

  handleLogout = () => {
    firebase.auth().signOut();
  }

  render() {
    const { user } = this.state;
    const nextPathName = (this.props.location.state && this.props.location.state.nextPathName) || '/';

    return <Errors>
      <Navbar
        user={user}
        handleLogout={this.handleLogout}
      />
      <div className="journal-body">
        <Switch>
          <Route exact={true} path='/login'>
            {user ?
              <Redirect to={nextPathName} /> :
              <LoginHome
                handleFacebookLogin={this.handleFacebookLogin}
                handleGoogleLogin={this.handleGoogleLogin} />
            }
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
