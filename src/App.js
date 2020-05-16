import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'
import firebase from 'firebase';


import './models/firebase';
import Home from './components/Notebook';
import './App.css';

const provider = new firebase.auth.GoogleAuthProvider();

class App extends React.Component {
  state = {
    user: null
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
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

    return <>
      <div className="navbar">
        <h3>Mr. Bullet</h3>
        <div className="right-nav-section">
          {user ?
            <button className="btn" onClick={this.handleGoogleLogout}>Logout</button> :
            <button className="btn" onClick={this.handleGoogleLogin}>Google Login</button>
          }
        </div>
      </div>
      <div className="journal-body">
        <Router>
          <Route exact={true} path='/'>
            <Home user={user} />
          </Route>
          <Route exact={true} path='/login'>
            {user ? <Redirect to='/' /> : <div></div>}
          </Route>
        </Router>
      </div>
    </>
  }
}

export default App;
