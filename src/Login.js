import React from 'react';

import firebase from 'firebase';


import './models/firebase';

const provider = new firebase.auth.GoogleAuthProvider();

class Login extends React.Component {
  state = {
    user: null,
    journalEntries: []
  }
  componentDidMount() {

  }

  handleGoogleLogin = () => {
    firebase.auth().signInWithPopup(provider).then(function (result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...
    }).catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
    });
  }

  render() {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <button onClick={this.handleGoogleLogin}>Login</button>
    </div>
  }
}

export default Login;

